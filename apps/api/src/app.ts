import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { parseContactRequest, saveContactRequest, type ContactStore } from "./contact.js";

function createPrismaContactStore(prisma: PrismaClient): ContactStore {
  return {
    countSince: (ipHash, since) => prisma.contactRequest.count({ where: { ipHash, createdAt: { gte: since } } }),
    create: async (request) => { await prisma.contactRequest.create({ data: request }); },
  };
}

export function createApp({ contactStore }: { contactStore?: ContactStore } = {}) {
  const prisma = contactStore ? null : new PrismaClient();
  const store = contactStore ?? createPrismaContactStore(prisma!);
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info", redact: ["req.headers.authorization", "req.body"] } });
  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

  app.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/contact")) return;
    const origin = request.headers.origin;
    if (origin && origin !== webOrigin) return reply.code(403).send({ message: "Origin not allowed." });
    if (origin === webOrigin) reply.headers({ "access-control-allow-origin": webOrigin, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "Origin" });
    if (request.method === "OPTIONS") return reply.code(204).send();
  });

  app.get("/health", async () => ({ status: "ok", service: "make3d-api" }));
  app.post("/contact", async (request, reply) => {
    const input = parseContactRequest(request.body);
    if (!input) return reply.code(400).send({ message: "Enter valid contact details and a message of at least 15 characters." });
    try {
      const result = await saveContactRequest(store, input, request.ip);
      if (!result.accepted) return reply.code(429).send({ message: "Too many requests. Please try again later." });
      return reply.code(201).send({ status: "accepted" });
    } catch {
      request.log.error("Unable to store contact request");
      return reply.code(503).send({ message: "Contact requests are temporarily unavailable." });
    }
  });
  if (prisma) app.addHook("onClose", async () => prisma.$disconnect());
  return app;
}
