import { createCipheriv, createHmac, randomBytes } from "node:crypto";

export const contactRequestTypes = ["MODEL_REQUEST", "PROBLEM_REPORT", "GENERAL_FEEDBACK"] as const;
export type ContactRequestType = typeof contactRequestTypes[number];

export type ContactRequestInput = {
  name: string;
  email: string;
  requestType: ContactRequestType;
  subject: string;
  message: string;
  website?: string;
};

export type ContactRequestRecord = {
  requestType: ContactRequestType;
  nameCiphertext: string;
  emailCiphertext: string;
  subjectCiphertext: string;
  messageCiphertext: string;
  ipHash: string;
};

export interface ContactStore {
  countSince(ipHash: string, since: Date): Promise<number>;
  create(request: ContactRequestRecord): Promise<void>;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitWindowMs = 60 * 60 * 1000;
const maxRequestsPerWindow = 5;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength ? value.trim() : null;
}

export function parseContactRequest(value: unknown): ContactRequestInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const name = cleanString(body.name, 120);
  const email = cleanString(body.email, 254);
  const subject = cleanString(body.subject, 160);
  const message = cleanString(body.message, 5_000);
  const requestType = body.requestType;
  const website = typeof body.website === "string" ? body.website.trim().slice(0, 200) : "";
  if (!name || name.length < 2 || !email || !emailPattern.test(email) || !subject || subject.length < 3 || !message || message.length < 15 || !contactRequestTypes.includes(requestType as ContactRequestType)) return null;
  return { name, email, subject, message, requestType: requestType as ContactRequestType, website };
}

function contactKey() {
  const encoded = process.env.CONTACT_ENCRYPTION_KEY;
  const key = encoded ? Buffer.from(encoded, "base64") : null;
  if (!key || key.length !== 32) throw new Error("CONTACT_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}

function encrypt(value: string, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export async function saveContactRequest(store: ContactStore, input: ContactRequestInput, ip: string) {
  if (input.website) return { accepted: true as const, honeypot: true as const };
  const key = contactKey();
  const ipHash = createHmac("sha256", key).update(ip).digest("base64url");
  const since = new Date(Date.now() - rateLimitWindowMs);
  if (await store.countSince(ipHash, since) >= maxRequestsPerWindow) return { accepted: false as const, rateLimited: true as const };
  await store.create({
    requestType: input.requestType,
    nameCiphertext: encrypt(input.name, key),
    emailCiphertext: encrypt(input.email, key),
    subjectCiphertext: encrypt(input.subject, key),
    messageCiphertext: encrypt(input.message, key),
    ipHash,
  });
  return { accepted: true as const, honeypot: false as const };
}
