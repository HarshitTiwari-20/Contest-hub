import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "./prisma.js";

export async function requireUser(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<{ id: string } | null> {
  const userId = (req.headers["x-user-id"] as string | undefined)?.trim();
  if (!userId) {
    await reply.status(401).send({ error: "Unauthorized — sign in required" });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    await reply.status(401).send({ error: "User not found" });
    return null;
  }

  return user;
}

export function optionalUserId(req: FastifyRequest): string | null {
  return (req.headers["x-user-id"] as string | undefined)?.trim() || null;
}
