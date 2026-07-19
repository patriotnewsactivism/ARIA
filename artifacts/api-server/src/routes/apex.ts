import { Router } from "express";

// Proxies ARIA's frontend to Apex's real 13-agent swarm API, keeping
// APEX_ADMIN_TOKEN server-side only (never sent to the browser).
// Part of the Apex+ARIA merge: ARIA's UI becomes the control room for
// Apex's actual agent workforce instead of ARIA's own local task table.

const router = Router();

function apexBase(): string {
  const base = process.env["APEX_BASE_URL"];
  if (!base) throw new Error("APEX_BASE_URL is not configured");
  return base.replace(/\/$/, "");
}

function apexHeaders(): Record<string, string> {
  const token = process.env["APEX_ADMIN_TOKEN"];
  if (!token) throw new Error("APEX_ADMIN_TOKEN is not configured");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// GET /apex/tasks — list real Apex swarm tasks (optional ?status=&agentId=&goalId=)
router.get("/apex/tasks", async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const r = await fetch(`${apexBase()}/api/tasks${qs ? `?${qs}` : ""}`, { headers: apexHeaders() });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Apex tasks");
    res.status(502).json({ error: "Failed to reach Apex" });
  }
});

// GET /apex/goals — list real Apex swarm goals
router.get("/apex/goals", async (req, res) => {
  try {
    const r = await fetch(`${apexBase()}/api/goals`, { headers: apexHeaders() });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Apex goals");
    res.status(502).json({ error: "Failed to reach Apex" });
  }
});

// POST /apex/goals — submit a new goal to the Apex swarm (CEO triages/delegates it)
router.post("/apex/goals", async (req, res) => {
  try {
    const r = await fetch(`${apexBase()}/api/goals`, {
      method: "POST",
      headers: apexHeaders(),
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Apex goal creation");
    res.status(502).json({ error: "Failed to reach Apex" });
  }
});

// GET /apex/projects — list the Apex project registry (health-card data for
// the Command Center view: name, priority, autonomy level per project)
router.get("/apex/projects", async (req, res) => {
  try {
    const r = await fetch(`${apexBase()}/api/projects`, { headers: apexHeaders() });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Apex projects");
    res.status(502).json({ error: "Failed to reach Apex" });
  }
});

// GET /apex/projects/status — bulk status() rollup for every project
// (goal/task counts by status, health flag, agentsInvolved, lastActivityAt).
// Registered BEFORE /apex/projects/:id so "status" isn't swallowed as an :id.
router.get("/apex/projects/status", async (req, res) => {
  try {
    const r = await fetch(`${apexBase()}/api/projects/status`, { headers: apexHeaders() });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Apex projects status");
    res.status(502).json({ error: "Failed to reach Apex" });
  }
});

// GET /apex/projects/:id — single project + its goals
router.get("/apex/projects/:id", async (req, res) => {
  try {
    const r = await fetch(`${apexBase()}/api/projects/${req.params.id}`, { headers: apexHeaders() });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Apex project detail");
    res.status(502).json({ error: "Failed to reach Apex" });
  }
});

// PATCH /apex/tasks/:id — update a real Apex task's status/priority
router.patch("/apex/tasks/:id", async (req, res) => {
  try {
    const r = await fetch(`${apexBase()}/api/tasks/${req.params.id}`, {
      method: "PATCH",
      headers: apexHeaders(),
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Apex task update");
    res.status(502).json({ error: "Failed to reach Apex" });
  }
});

export default router;
