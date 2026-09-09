import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();
afterAll(() => app.close());

describe("GET /health", () => {
  it("returns service health", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "make3d-api" });
  });
});
