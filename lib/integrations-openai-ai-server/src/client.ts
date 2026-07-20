import OpenAI from "openai";

// ─── Multi-Provider Fallback Client for ARIA's chat ───────────────────────────
//
// ARIA previously hard-required OPENAI_API_KEY (crashed on boot if unset).
// This mirrors the Apex pattern (packages/core/src/llm-client.ts): try
// OpenAI first (native gpt-4.1, best quality), then fall back through free
// providers in order if OpenAI is unavailable, unset, or errors/rate-limits.
// Config-driven — add a new provider by adding one array entry.
//
// Only the streaming chat.completions.create() call site is used by ARIA
// (artifacts/api-server/src/routes/openai.ts), so this proxy only needs to
// support that shape. Fallback happens at request-creation time (before the
// stream starts) — once a provider's stream begins, we commit to it.

const PROVIDERS: Array<{
  name: string;
  baseURL?: string; // omit for native OpenAI
  apiKeyEnv: string;
  fallbackModel?: string; // remap model id for providers that don't support gpt-4.1
}> = [
  { name: "openai", apiKeyEnv: "OPENAI_API_KEY" },
  { name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKeyEnv: "OPENROUTER_API_KEY", fallbackModel: "openai/gpt-4.1" },
  // GitHub Models -- free via the existing GITHUB_TOKEN_4 PAT (used elsewhere
  // in this ecosystem for repo writes), no separate signup. Actually serves
  // real gpt-4.1 (same model family as the native OpenAI tier above), unlike
  // the free-tier Llama/Mistral models further down this chain. Live-verified
  // 2026-07-20 against the real endpoint before wiring in.
  { name: "github-models", baseURL: "https://models.github.ai/inference", apiKeyEnv: "GITHUB_TOKEN_4", fallbackModel: "openai/gpt-4.1" },
  // Qwen Cloud (Alibaba Cloud Model Studio, international dashscope-intl
  // endpoint -- NOT the mainland Bailian console, separate account/URL).
  // PAID pay-as-you-go, NOT free -- kept after github-models (real gpt-4.1,
  // highest quality free-ish tier) but before the remaining free tiers below
  // since it's cheap and has no shared-quota risk. Live-verified 2026-07-20.
  { name: "qwen-cloud", baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1", apiKeyEnv: "QWENCLOUD_API_KEY", fallbackModel: "qwen3-coder-plus" },
  { name: "cerebras", baseURL: "https://api.cerebras.ai/v1", apiKeyEnv: "CEREBRAS_API_KEY", fallbackModel: "gpt-oss-120b" },
  { name: "mistral", baseURL: "https://api.mistral.ai/v1", apiKeyEnv: "MISTRAL_API_KEY", fallbackModel: "mistral-small-latest" },
  { name: "groq", baseURL: "https://api.groq.com/openai/v1", apiKeyEnv: "GROQ_API_KEY", fallbackModel: "llama-3.3-70b-versatile" },
  { name: "cohere-trial", baseURL: "https://api.cohere.com/compatibility/v1", apiKeyEnv: "COHERE_TRIAL_API_KEY", fallbackModel: "command-r-plus-08-2024" },
  { name: "cohere", baseURL: "https://api.cohere.com/compatibility/v1", apiKeyEnv: "COHERE_API_KEY", fallbackModel: "command-r-plus-08-2024" },
  { name: "openrouter-free", baseURL: "https://openrouter.ai/api/v1", apiKeyEnv: "OPENROUTER_API_KEY", fallbackModel: "poolside/laguna-m.1:free" },
];

const clientCache = new Map<string, OpenAI>();

function clientFor(provider: (typeof PROVIDERS)[number]): OpenAI | null {
  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) return null;
  const cacheKey = provider.name;
  if (!clientCache.has(cacheKey)) {
    clientCache.set(
      cacheKey,
      new OpenAI({ apiKey, ...(provider.baseURL ? { baseURL: provider.baseURL } : {}) })
    );
  }
  return clientCache.get(cacheKey)!;
}

async function createWithFallback(params: any) {
  let lastError: unknown = null;
  for (const provider of PROVIDERS) {
    const client = clientFor(provider);
    if (!client) continue; // no key set for this provider, skip silently
    try {
      const model = provider.fallbackModel ?? params.model;
      // eslint-disable-next-line no-console
      console.log(`[llm-fallback] trying provider=${provider.name} model=${model}`);
      return await client.chat.completions.create({ ...params, model });
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-console
      console.error(`[llm-fallback] provider=${provider.name} failed:`, err instanceof Error ? err.message : err);
      continue;
    }
  }
  throw lastError ?? new Error("No LLM provider available — set at least one of: " + PROVIDERS.map((p) => p.apiKeyEnv).join(", "));
}

// Drop-in replacement for the old `openai` export — same call shape
// (`openai.chat.completions.create(...)`), now with automatic fallback.
export const openai = {
  chat: {
    completions: {
      create: createWithFallback,
    },
  },
} as unknown as OpenAI;
