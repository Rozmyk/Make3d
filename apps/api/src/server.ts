import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.API_PORT ?? 4000);

app.listen({ port, host: "0.0.0.0" }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
