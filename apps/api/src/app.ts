import Fastify from "fastify";

export function createApp() {
  const app = Fastify({ logger: true });
  app.get("/health", async () => ({ status: "ok", service: "make3d-api" }));
  return app;
}
