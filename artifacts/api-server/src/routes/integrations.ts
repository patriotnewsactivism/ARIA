import { Router } from "express";
import { db } from "@workspace/db";
import { integrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { OAUTH_PROVIDERS, getRedirectUri } from "../lib/oauth-providers.js";

const router = Router();

// GET /integrations
router.get("/integrations", async (req, res) => {
  try {
    const rows = await db.select().from(integrationsTable);
    // Never leak tokens to the frontend.
    const safe = rows.map(({ accessToken, refreshToken, ...rest }) => rest);
    res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Failed to list integrations");
    res.status(500).json({ error: "Failed to list integrations" });
  }
});

// GET /integrations/:id
router.get("/integrations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(integrationsTable).where(eq(integrationsTable.id, id));
    if (!row) return res.status(404).json({ error: "Integration not found" });
    const { accessToken, refreshToken, ...safe } = row;
    res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Failed to get integration");
    res.status(500).json({ error: "Failed to get integration" });
  }
});

// PATCH /integrations/:id
router.patch("/integrations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Never allow the frontend to write tokens directly.
    const { accessToken, refreshToken, tokenExpiresAt, ...body } = req.body ?? {};
    const [row] = await db
      .update(integrationsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(integrationsTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Integration not found" });
    const { accessToken: _a, refreshToken: _r, ...safe } = row;
    res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Failed to update integration");
    res.status(500).json({ error: "Failed to update integration" });
  }
});

// POST /integrations/:id/connect
// Real OAuth2 authorize-URL generation. No simulated/demo URLs.
router.post("/integrations/:id/connect", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [integration] = await db.select().from(integrationsTable).where(eq(integrationsTable.id, id));
    if (!integration) return res.status(404).json({ error: "Integration not found" });

    const provider = OAUTH_PROVIDERS[integration.slug];
    if (!provider) {
      return res.status(400).json({
        error: "not_supported",
        message: `${integration.name} doesn't have OAuth wired up yet. This integration is cataloged but not yet connectable.`,
      });
    }

    const clientId = process.env[provider.clientIdEnv];
    const clientSecret = process.env[provider.clientSecretEnv];
    if (!clientId || !clientSecret) {
      await db
        .update(integrationsTable)
        .set({ status: "error", lastError: `Missing ${provider.clientIdEnv}/${provider.clientSecretEnv} in environment`, updatedAt: new Date() })
        .where(eq(integrationsTable.id, id));
      return res.status(400).json({
        error: "not_configured",
        message: `${integration.name} OAuth app credentials aren't set up yet. An admin needs to add ${provider.clientIdEnv} and ${provider.clientSecretEnv} to the environment before this can connect for real.`,
      });
    }

    const state = Buffer.from(JSON.stringify({ integrationId: id, ts: Date.now() })).toString("base64url");
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      state,
      response_type: "code",
      scope: integration.scopes ?? "",
      ...(provider.extraAuthorizeParams ?? {}),
    });
    const authUrl = `${provider.authorizeUrl}?${params.toString()}`;

    const [updated] = await db
      .update(integrationsTable)
      .set({ status: "pending", lastError: null, updatedAt: new Date() })
      .where(eq(integrationsTable.id, id))
      .returning();
    const { accessToken, refreshToken, ...safe } = updated;

    res.json({ authUrl, state, integration: safe });
  } catch (err) {
    req.log.error({ err }, "Failed to initiate OAuth");
    res.status(500).json({ error: "Failed to initiate OAuth" });
  }
});

// GET /integrations/oauth/callback
// Real token exchange. The OAuth vendor redirects the user's browser here
// after they approve access, with ?code=...&state=...
router.get("/integrations/oauth/callback", async (req, res) => {
  const { code, state, error: oauthError } = req.query as Record<string, string>;
  const frontendBase = process.env.ARIA_FRONTEND_URL || "https://aria.donmatthews.live";

  if (oauthError) {
    return res.redirect(`${frontendBase}/integrations?oauth_error=${encodeURIComponent(oauthError)}`);
  }
  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state" });
  }

  let integrationId: number;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    integrationId = decoded.integrationId;
  } catch {
    return res.status(400).json({ error: "Invalid state" });
  }

  try {
    const [integration] = await db.select().from(integrationsTable).where(eq(integrationsTable.id, integrationId));
    if (!integration) return res.status(404).json({ error: "Integration not found" });

    const provider = OAUTH_PROVIDERS[integration.slug];
    if (!provider) return res.status(400).json({ error: "Provider not supported" });

    const clientId = process.env[provider.clientIdEnv];
    const clientSecret = process.env[provider.clientSecretEnv];
    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: "not_configured" });
    }

    const tokenBody = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    };

    let tokenRes: Response;
    if (provider.tokenRequestStyle === "json") {
      tokenRes = await fetch(provider.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(tokenBody),
      });
    } else {
      tokenRes = await fetch(provider.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams(tokenBody),
      });
    }

    const tokenJson: any = await tokenRes.json().catch(() => ({}));

    if (!tokenRes.ok || tokenJson.error) {
      const msg = tokenJson.error_description || tokenJson.error || `HTTP ${tokenRes.status}`;
      await db
        .update(integrationsTable)
        .set({ status: "error", lastError: `Token exchange failed: ${msg}`, updatedAt: new Date() })
        .where(eq(integrationsTable.id, integrationId));
      return res.redirect(`${frontendBase}/integrations?oauth_error=${encodeURIComponent(msg)}`);
    }

    const accessTokenKey = provider.accessTokenKey ?? "access_token";
    const refreshTokenKey = provider.refreshTokenKey ?? "refresh_token";
    const accessToken = tokenJson[accessTokenKey];
    const refreshToken = tokenJson[refreshTokenKey] ?? null;
    const expiresIn = tokenJson.expires_in ? Number(tokenJson.expires_in) : null;

    await db
      .update(integrationsTable)
      .set({
        status: "connected",
        enabled: true,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        connectedAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(integrationsTable.id, integrationId));

    res.redirect(`${frontendBase}/integrations?connected=${encodeURIComponent(integration.slug)}`);
  } catch (err) {
    req.log.error({ err }, "OAuth callback failed");
    res.redirect(`${frontendBase}/integrations?oauth_error=internal_error`);
  }
});

// POST /integrations/:id/disconnect
router.post("/integrations/:id/disconnect", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(integrationsTable)
      .set({ status: "disconnected", enabled: false, connectedAt: null, accessToken: null, refreshToken: null, tokenExpiresAt: null, updatedAt: new Date() })
      .where(eq(integrationsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Integration not found" });
    const { accessToken, refreshToken, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Failed to disconnect integration");
    res.status(500).json({ error: "Failed to disconnect integration" });
  }
});

export default router;
