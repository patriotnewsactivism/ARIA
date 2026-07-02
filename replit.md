# ARIA — AI Coworker

ARIA (Autonomous Reasoning & Integration Agent) is a fully managed AI coworker that lives in the cloud, with its own shell, persistent memory, task queue, streaming chat powered by GPT-4.1, and OAuth-connected business integrations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/aria run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Postgres), `OPENAI_API_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui, dark mission-control design
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI GPT-4.1 (streaming SSE chat)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aria/src/pages/` — all 8 frontend pages (dashboard, chat, tasks, shell, integrations, memory, workflows, settings)
- `artifacts/aria/src/App.tsx` — router setup with wouter
- `artifacts/api-server/src/routes/` — all backend route handlers
- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle schema files (agent, conversations, tasks, shell, integrations, memory, actions, workflows)
- `lib/integrations-openai-ai-server/` — OpenAI SDK client (uses `OPENAI_API_KEY`)

## Pages

- `/` — Dashboard: live status, stats, in-progress tasks, activity feed, expansion prompts
- `/chat` — Streaming chat with ARIA (SSE via GPT-4.1), conversation history sidebar
- `/tasks` — Kanban task board with status/priority filtering and CRUD
- `/shell` — Terminal emulator with real command execution per session
- `/integrations` — OAuth integration hub (Google, GitHub, Slack, Notion, Linear, etc.)
- `/memory` — ARIA's persistent knowledge store (key/value with categories)
- `/workflows` — Automated workflow rules with enable/disable toggles
- `/settings` — Agent identity, system prompt, timezone, language

## Architecture decisions

- All API contracts defined in OpenAPI first, then codegen generates typed React Query hooks and Zod validators
- Shell execution strips secrets from child process `env` and blocks dangerous patterns; runs with 15s timeout
- OpenAI route mounted at `/openai` in the router, route handler uses `/conversations/:id/messages` (no double prefix)
- Agent singleton: first GET to `/api/agent` creates the row if it doesn't exist
- SSE streaming for chat — raw fetch + ReadableStream on the frontend, not generated hooks

## Expansion Prompts

1. **Gmail via OAuth** — Connect Google Workspace; implement compose + send via Gmail API
2. **Voice mode** — OpenAI audio API for speech output + gpt-4o-mini-transcribe for voice input
3. **GitHub PR reviewer** — Monitor PRs, review diffs, post comments via GitHub OAuth integration
4. **Vector memory** — pgvector embeddings for semantic search across past conversations + memory
5. **Slack bot persona** — ARIA responds to @mentions, executes tasks, posts results to threads
6. **Cron job runner** — Schedule workflows with cron triggers; log all runs to activity feed

## User preferences

_Populate as you build._

## Gotchas

- After any `lib/*` change, run `pnpm run typecheck:libs` before leaf artifact checks or leaf typechecks see stale declarations
- OpenAI integration lib checks for `OPENAI_API_KEY` (not the Replit AI Integrations vars) — all three client files (client.ts, image/client.ts, audio/client.ts) were patched to support direct key
- Shell route strips environment variables from child processes to prevent secret exfiltration
- `pnpm --filter @workspace/db run push-force` if column conflicts during schema push

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
