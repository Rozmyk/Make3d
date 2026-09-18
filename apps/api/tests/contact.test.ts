import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import type { ContactRequestRecord, ContactStore } from "../src/contact.js";

const previousKey = process.env.CONTACT_ENCRYPTION_KEY;
beforeEach(() => { process.env.CONTACT_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64"); });

afterEach(() => {
  if (previousKey) process.env.CONTACT_ENCRYPTION_KEY = previousKey;
  else delete process.env.CONTACT_ENCRYPTION_KEY;
});

function memoryStore() {
  const requests: ContactRequestRecord[] = [];
  const store: ContactStore = {
    countSince: async () => requests.length,
    create: async (request) => { requests.push(request); },
  };
  return { requests, store };
}

describe("POST /contact", () => {
  it("stores encrypted contact data without placing it in a response", async () => {
    const { requests, store } = memoryStore();
    const app = createApp({ contactStore: store });
    const response = await app.inject({ method: "POST", url: "/contact", payload: { name: "Ada Lovelace", email: "ada@example.com", requestType: "MODEL_REQUEST", subject: "Router mount", message: "I need a wall mount for a router that is 160 mm wide." } });
    await app.close();

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ status: "accepted" });
    expect(requests).toHaveLength(1);
    expect(requests[0].emailCiphertext).not.toContain("ada@example.com");
    expect(requests[0].messageCiphertext).not.toContain("160 mm");
    expect(requests[0].ipHash).not.toContain("127.0.0.1");
  });

  it("rejects malformed input and accepts honeypot submissions without storing them", async () => {
    const { requests, store } = memoryStore();
    const app = createApp({ contactStore: store });
    const invalid = await app.inject({ method: "POST", url: "/contact", payload: { name: "A", email: "not-an-email", requestType: "MODEL_REQUEST", subject: "x", message: "short" } });
    const bot = await app.inject({ method: "POST", url: "/contact", payload: { name: "Ada Lovelace", email: "ada@example.com", requestType: "MODEL_REQUEST", subject: "Router mount", message: "I need a wall mount for a router that is 160 mm wide.", website: "https://spam.example" } });
    await app.close();

    expect(invalid.statusCode).toBe(400);
    expect(bot.statusCode).toBe(201);
    expect(requests).toHaveLength(0);
  });

  it("limits origins and rate-limits repeated requests", async () => {
    const store: ContactStore = { countSince: async () => 5, create: async () => {} };
    const app = createApp({ contactStore: store });
    const blockedOrigin = await app.inject({ method: "OPTIONS", url: "/contact", headers: { origin: "https://attacker.example" } });
    const limited = await app.inject({ method: "POST", url: "/contact", payload: { name: "Ada Lovelace", email: "ada@example.com", requestType: "MODEL_REQUEST", subject: "Router mount", message: "I need a wall mount for a router that is 160 mm wide." } });
    await app.close();

    expect(blockedOrigin.statusCode).toBe(403);
    expect(limited.statusCode).toBe(429);
  });
});
