import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  loginSchema,
  publicUser,
  registerSchema,
} from "../lib/auth-schemas.js";

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", async (req, reply) => {
    try {
      const body = registerSchema.parse(req.body);

      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: body.email.toLowerCase() },
            { username: body.username.toLowerCase() },
          ],
        },
      });

      if (existing) {
        const field =
          existing.email === body.email.toLowerCase() ? "email" : "username";
        return reply.status(409).send({
          error: `An account with this ${field} already exists`,
          field,
        });
      }

      const passwordHash = await bcrypt.hash(body.password, 12);
      const username = body.username.toLowerCase();
      const user = await prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          username,
          passwordHash,
          name: body.name?.trim() || username,
        },
      });

      return reply.status(201).send({ user: publicUser(user) });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: formatZodError(err),
        });
      }
      req.log.error(err);
      return reply.status(500).send({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, reply) => {
    try {
      const body = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });

      if (!user?.passwordHash) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(body.password, user.passwordHash);
      if (!valid) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      return reply.send({ user: publicUser(user) });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: formatZodError(err),
        });
      }
      req.log.error(err);
      return reply.status(500).send({ error: "Failed to sign in" });
    }
  });

  app.get("/api/auth/me", async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Optional: JWT from Fastify if later wired. For now NextAuth owns sessions.
    return reply.status(501).send({
      error: "Use NextAuth session on the web app",
    });
  });
}
