import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL; // optional, omit for direct OpenAI

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY must be set.",
    );
  }
  if (!_client) {
    _client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
  }
  return _client;
}

// Lazy proxy: does NOT throw at module load / import time (which was crashing
// the whole api-server on boot even for requests that never touch OpenAI).
// Only throws when an OpenAI call is actually attempted without a key set.
export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
