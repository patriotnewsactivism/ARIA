# ARIA — AI Coworker

## Project Overview

ARIA (Autonomous Reasoning & Integration Agent) is a cloud-based AI coworker with its own shell, persistent memory, task queue, streaming chat (GPT-4.1), and OAuth-connected business integrations. The repository is a **pnpm monorepo** containing the React frontend, Express API server, shared database layer, generated API clients, and an mockup sandbox.

This workspace follows a **package-first architecture**:

- `artifacts/aria` — React + Vite frontend (the "mission control" UI).
- `artifacts/api-server` — Express API server, also proxies to the APEX 13-agent swarm.
- `lib/db` — Drizzle ORM schemas and Postgres connection.
- `lib/api-spec` — Single source of truth OpenAPI spec.
- `lib/api-client-react` / `lib/api-zod` — Auto-generated React Query hooks and Zod validators from the OpenAPI spec.
- `lib/integrations-openai-ai-*` — Shared OpenAI client wrappers (server + React).
- `artifacts/mockup-sandbox` — UI component/playground artifact.

### Recent Context

ARIA is being merged with the APEX autonomous-agent workforce. The `apex.ts` route in `api-server` proxies select requests to an external APEX swarm API, keeping `APEX_ADMIN_TOKEN` server-side only. ARIA's local tasks table is being superseded by real Apex tasks/goals.

## Building and Running

> **Package manager:** `pnpm` (enforced via `preinstall` script). Do not use npm or yarn.

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL database (set `DATABASE_URL`)
- `OPENAI_API_KEY`
- `SESSION_SECRET`
- For APEX proxy: `APEX_BASE_URL` and `APEX_ADMIN_TOKEN`

### Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install workspace dependencies. |
| `pnpm --filter @workspace/aria run dev` | Start the Vite frontend dev server. |
| `pnpm --filter @workspace/api-server run dev` | Build and start the API server. |
| `pnpm --filter @workspace/api-server run start` | Run the already-built API server. |
| `pnpm run typecheck` | Type-check all packages and artifacts. |
| `pnpm run build` | Type-check and build every package/artifact. |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate React Query hooks and Zod schemas from `openapi.yaml`. |
| `pnpm --filter @workspace/db run push` | Push Drizzle schema changes (dev only). |
| `pnpm --filter @workspace/db run push-force` | Force-push Drizzle schema changes. |

### Important Runtime Notes

- `artifacts/aria` requires `PORT` and `BASE_PATH` env vars to even load `vite.config.ts`.
- `artifacts/api-server` requires `PORT`.
- The OpenAI integration expects `OPENAI_API_KEY` (not Replit AI Integration variables).
- After any change in `lib/*`, run `pnpm run typecheck:libs` before leaf typechecks, otherwise declarations may be stale.

## Development Conventions

### Workspace & Packages

- Uses **pnpm workspaces** with a shared catalog in `pnpm-workspace.yaml`.
- All packages are private and versioned `0.0.0`.
- Shared TypeScript options live in `tsconfig.base.json`; each package extends it.
- Package names follow the `@workspace/<name>` pattern.

### API-First Development

- The canonical API contract is `lib/api-spec/openapi.yaml`.
- Running `pnpm --filter @workspace/api-spec run codegen` produces:
  - `lib/api-client-react/src/generated/*` — typed React Query hooks.
  - `lib/api-zod/src/generated/*` — Zod validators and TypeScript types.
- Do not hand-edit generated files; update the OpenAPI spec and re-run codegen.

### Frontend

- React 19, Vite 7, Tailwind CSS 4, shadcn/ui components, dark mission-control theme.
- Routing via `wouter`.
- Alias `@` maps to `src`.
- Pages live in `artifacts/aria/src/pages/`.

### Backend

- Express 5 with `pino` logging.
- Routes are mounted under `/api` in `artifacts/api-server/src/app.ts`.
- Database access through `lib/db` using Drizzle ORM + `pg` driver.

### Database

- Schemas are in `lib/db/src/schema/`.
- One file per domain: `agent.ts`, `conversations.ts`, `tasks.ts`, `shell.ts`, `integrations.ts`, `memory.ts`, `actions.ts`, `workflows.ts`.
- Run migrations/pushes with `pnpm --filter @workspace/db run push`.

### OpenAI Integration

- Server package: `lib/integrations-openai-ai-server/`.
- React package: `lib/integrations-openai-ai-react/`.
- GPT-4.1 streaming chat is implemented directly in the `conversations` route, not via generated hooks.

### Security & Secrets

- API keys and tokens must live in environment variables; never commit them.
- `APEX_ADMIN_TOKEN` and `OPENAI_API_KEY` are server-side secrets.
- Shell execution strips child process environment variables and blocks dangerous patterns; it also runs with a timeout.

### ARIA ↔ APEX Merge Notes

- `artifacts/api-server/src/routes/apex.ts` proxies `/apex/*` to the APEX swarm API.
- ARIA's local task board is being replaced by real APEX tasks/goals via these proxy routes.
- Keep the APEX admin token out of the browser and logs.

### Testing & Quality

- There is no test suite currently configured.
- Always run `pnpm run typecheck` after codegen or schema changes.
- Prettier is installed at the workspace level for formatting.
