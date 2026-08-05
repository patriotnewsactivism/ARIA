import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "./rate-limit.ts";
import type { Request, Response } from "express";

describe("rateLimit middleware", () => {
  it("allows requests under the limit", () => {
    const middleware = rateLimit({ windowMs: 1000, max: 2 });
    let called = false;
    const next = () => {
      called = true;
    };
    const res = { setHeader: () => {}, status: () => ({ json: () => {} }) } as unknown as Response;
    middleware({ ip: "1.2.3.4" } as Request, res, next);
    assert.strictEqual(called, true);
  });

  it("blocks requests over the limit", () => {
    const middleware = rateLimit({ windowMs: 1000, max: 1, message: { error: "slow down" } });
    const res1 = { setHeader: () => {}, status: (code: number) => ({ json: () => code }) } as unknown as Response;
    middleware({ ip: "1.2.3.4" } as Request, res1, () => {});

    let blockedCode = 0;
    const res2 = {
      setHeader: () => {},
      status: (code: number) => {
        blockedCode = code;
        return { json: () => {} };
      },
    } as unknown as Response;
    middleware({ ip: "1.2.3.4" } as Request, res2, () => {});
    assert.strictEqual(blockedCode, 429);
  });
});
