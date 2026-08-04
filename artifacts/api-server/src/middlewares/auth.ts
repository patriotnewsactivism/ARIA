import type { Request, Response, NextFunction } from "express";

// Simple bearer-token auth guard. In production, ARIA sits behind a reverse
// proxy / Replit auth; this middleware ensures the API is not left wide open
// if the proxy is bypassed or during local development.
// Set API_TOKEN to a strong secret and pass it as `Authorization: Bearer <token>`.

const API_TOKEN = process.env["API_TOKEN"];
const PUBLIC_PATHS = new Set(["/api/healthz"]);

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "development" && !API_TOKEN) {
    return next();
  }

  if (PUBLIC_PATHS.has(req.path)) {
    return next();
  }

  if (!API_TOKEN) {
    return res.status(500).json({ error: "API_TOKEN not configured" });
  }

  const header = req.headers.authorization || "";
  const parts = header.split(" ");
  if (parts[0] !== "Bearer" || parts[1] !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
