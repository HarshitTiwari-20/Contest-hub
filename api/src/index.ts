import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { registerRoutes } from "./routes/index.js";

const PORT = Number(process.env.PORT ?? 4000);

/** Browser Origin never has a trailing slash — strip them so env typos don't break CORS. */
function parseCorsOrigins(raw: string | undefined): string[] {
  const value = raw?.trim() || "http://localhost:3000";
  return value
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

const CORS_ORIGINS = parseCorsOrigins(process.env.CORS_ORIGIN);

async function main() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  await app.register(cors, {
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
  });

  await app.register(helmet, { contentSecurityPolicy: false });

  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });

  app.get("/health", async () => ({
    ok: true,
    service: "contest-hub-api",
    time: new Date().toISOString(),
  }));

  await registerRoutes(app);

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`Contest Hub API listening on :${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
