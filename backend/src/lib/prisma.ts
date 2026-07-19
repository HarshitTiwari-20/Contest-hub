import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Hosted Postgres needs SSL. Avoid putting sslmode=require in the URL when
 * we also pass an `ssl` object — that triggers pg's deprecation warning and
 * can confuse connection setup on Render.
 */
function buildConnectionConfig(connectionString: string) {
  let cleaned = connectionString;
  const hosted =
    /prisma\.io|neon\.tech|supabase|render\.com|amazonaws\.com|sslmode=require/i.test(
      connectionString
    );

  try {
    const url = new URL(connectionString);
    // Remove sslmode so `pg` doesn't treat it specially; we set ssl below.
    url.searchParams.delete("sslmode");
    url.searchParams.delete("ssl");
    cleaned = url.toString();
  } catch {
    cleaned = connectionString
      .replace(/[?&]sslmode=[^&]*/gi, "")
      .replace(/[?&]ssl=[^&]*/gi, "");
  }

  return {
    connectionString: cleaned,
    ssl: hosted ? { rejectUnauthorized: false } : undefined,
  };
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const config = buildConnectionConfig(connectionString);
  const adapter = new PrismaPg(config);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse across hot reloads (dev) and keep a single client in production too
globalForPrisma.prisma = prisma;
