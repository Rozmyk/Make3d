import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

const localEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
if (process.env.NODE_ENV !== "production" && existsSync(localEnvPath)) process.loadEnvFile(localEnvPath);

const app = createApp();
const port = Number(process.env.API_PORT ?? 4000);

app.listen({ port, host: "0.0.0.0" }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
