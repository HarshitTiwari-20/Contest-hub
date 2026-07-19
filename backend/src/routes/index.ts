import type { FastifyInstance } from "fastify";
import { z, ZodError } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireUser, optionalUserId } from "../lib/auth.js";
import { publicUser } from "../lib/auth-schemas.js";
import { registerAuthRoutes } from "./auth.js";
import {
  getUserSolvedKeys,
  mergeHeatmaps,
  mergeRatingHistory,
  syncPlatformAccount,
} from "../services/platforms/sync.js";
import {
  GOAL_TEMPLATES,
  PRACTICE_SHEETS,
} from "../data/catalog.js";
import type { Platform, GoalPeriod } from "../generated/prisma/client.js";
import { randomBytes } from "node:crypto";
import { fetchAllUpcomingContests } from "../services/contests.js";

function formatZod(error: ZodError) {
  return error.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));
}

const CONNECTABLE: Platform[] = [
  "CODEFORCES",
  "LEETCODE",
  "CODECHEF",
  "ATCODER",
  "GFG",
  "HACKERRANK",
  "CSES",
  "GITHUB",
];

export async function registerRoutes(app: FastifyInstance) {
  await registerAuthRoutes(app);

  // ─── Me ───────────────────────────────────────────────────────────
  app.get("/api/me", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      include: { platformAccounts: true },
    });
    if (!user) return reply.status(404).send({ error: "User not found" });

    return {
      user: publicUser(user),
      accounts: user.platformAccounts.map(serializeAccount),
      connected: user.platformAccounts.length > 0,
    };
  });

  // ─── Platforms ────────────────────────────────────────────────────
  app.get("/api/platforms", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const accounts = await prisma.platformAccount.findMany({
      where: { userId: auth.id },
      orderBy: { platform: "asc" },
    });
    return {
      accounts: accounts.map(serializeAccount),
      available: CONNECTABLE,
    };
  });

  app.post("/api/platforms/connect", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    try {
      const body = z
        .object({
          platform: z.enum([
            "CODEFORCES",
            "LEETCODE",
            "CODECHEF",
            "ATCODER",
            "GFG",
            "HACKERRANK",
            "CSES",
            "GITHUB",
          ]),
          handle: z.string().trim().min(1).max(64),
        })
        .parse(req.body);

      const account = await syncPlatformAccount(
        auth.id,
        body.platform as Platform,
        body.handle
      );
      return { account: serializeAccount(account), ok: true };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: "Validation failed", issues: formatZod(err) });
      }
      const message = err instanceof Error ? err.message : "Failed to connect";
      return reply.status(400).send({ error: message });
    }
  });

  app.post("/api/platforms/:platform/sync", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { platform } = req.params as { platform: string };
    const account = await prisma.platformAccount.findUnique({
      where: {
        userId_platform: {
          userId: auth.id,
          platform: platform.toUpperCase() as Platform,
        },
      },
    });
    if (!account) {
      return reply.status(404).send({ error: "Platform not connected" });
    }
    try {
      const updated = await syncPlatformAccount(
        auth.id,
        account.platform,
        account.handle
      );
      return { account: serializeAccount(updated), ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      return reply.status(400).send({ error: message });
    }
  });

  app.delete("/api/platforms/:platform", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { platform } = req.params as { platform: string };
    await prisma.platformAccount.deleteMany({
      where: { userId: auth.id, platform: platform.toUpperCase() as Platform },
    });
    return { ok: true };
  });

  // ─── Dashboard & Analytics ────────────────────────────────────────
  app.get("/api/dashboard", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    const accounts = await prisma.platformAccount.findMany({
      where: { userId: auth.id },
    });

    if (!accounts.length) {
      return {
        connected: false,
        message: "Connect a coding platform to see your dashboard",
        stats: null,
        heatmap: [],
        ratingHistory: [],
        upcomingContests: await fetchAllUpcomingContests(8),
        recentSubmissions: [],
        goals: [],
        accounts: [],
      };
    }

    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    const submissions = await prisma.submission.findMany({
      where: { userId: auth.id },
      orderBy: { submittedAt: "desc" },
      take: 15,
      include: { problem: true },
    });
    const goals = await prisma.goal.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const stats = buildStats(accounts, user);
    return {
      connected: true,
      stats,
      heatmap: mergeHeatmaps(accounts),
      ratingHistory: mergeRatingHistory(accounts),
      upcomingContests: await fetchAllUpcomingContests(8),
      recentSubmissions: submissions.map((s) => ({
        id: s.id,
        verdict: s.verdict,
        language: s.language,
        platform: s.platform,
        submittedAt: s.submittedAt.toISOString(),
        problemTitle: s.problem.title,
        problemUrl: s.problem.url,
        difficulty: s.problem.difficulty,
      })),
      goals,
      accounts: accounts.map(serializeAccount),
    };
  });

  app.get("/api/analytics", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    const accounts = await prisma.platformAccount.findMany({
      where: { userId: auth.id },
    });

    if (!accounts.length) {
      return {
        connected: false,
        message: "Connect a coding platform to see analytics",
      };
    }

    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    const submissions = await prisma.submission.findMany({
      where: { userId: auth.id },
      include: { problem: true },
      orderBy: { submittedAt: "desc" },
      take: 500,
    });

    const verdictCounts: Record<string, number> = {};
    const langCounts: Record<string, number> = {};
    const diffCounts: Record<string, number> = {};
    for (const s of submissions) {
      verdictCounts[s.verdict] = (verdictCounts[s.verdict] ?? 0) + 1;
      langCounts[s.language] = (langCounts[s.language] ?? 0) + 1;
      diffCounts[s.problem.difficulty] =
        (diffCounts[s.problem.difficulty] ?? 0) + 1;
    }

    // Topic mastery from problem tags of AC submissions
    const tagCounts: Record<string, { solved: number; total: number }> = {};
    for (const s of submissions) {
      for (const tag of s.problem.tags) {
        if (!tagCounts[tag]) tagCounts[tag] = { solved: 0, total: 0 };
        tagCounts[tag].total++;
        if (s.verdict === "AC") tagCounts[tag].solved++;
      }
    }
    const topicMastery = Object.entries(tagCounts)
      .map(([topic, v]) => ({
        topic,
        strength: Math.round((v.solved / Math.max(1, v.total)) * 100),
        solved: v.solved,
        total: v.total,
        weak: v.solved / Math.max(1, v.total) < 0.45,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return {
      connected: true,
      stats: buildStats(accounts, user),
      ratingHistory: mergeRatingHistory(accounts),
      heatmap: mergeHeatmaps(accounts),
      topicMastery,
      verdictCounts,
      langCounts,
      diffCounts,
      platformAccounts: accounts.map(serializeAccount),
      recentSubmissions: submissions.slice(0, 30).map((s) => ({
        id: s.id,
        verdict: s.verdict,
        language: s.language,
        platform: s.platform,
        submittedAt: s.submittedAt.toISOString(),
        problemTitle: s.problem.title,
        problemUrl: s.problem.url,
        difficulty: s.problem.difficulty,
      })),
    };
  });

  // ─── Contests (multi-platform) ────────────────────────────────────
  app.get("/api/contests", async (req) => {
    const contests = await fetchAllUpcomingContests(100);
    const q = req.query as { status?: string; platform?: string; search?: string };
    let list = contests;
    if (q.status) list = list.filter((c) => c.status === q.status!.toUpperCase());
    if (q.platform) list = list.filter((c) => c.platform === q.platform!.toUpperCase());
    if (q.search) {
      const s = q.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.platform.toLowerCase().includes(s)
      );
    }
    return { contests: list, total: list.length };
  });

  // ─── Problems ─────────────────────────────────────────────────────
  app.get("/api/problems", async (req, reply) => {
    const userId = optionalUserId(req);
    const q = req.query as {
      search?: string;
      platform?: string;
      difficulty?: string;
      tag?: string;
      company?: string;
      solved?: string;
      page?: string;
      limit?: string;
    };

    const where: Record<string, unknown> = {};
    if (q.platform) where.platform = q.platform.toUpperCase();
    if (q.difficulty) where.difficulty = q.difficulty.toUpperCase();
    if (q.tag) where.tags = { has: q.tag };
    if (q.company) where.companies = { has: q.company };
    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: "insensitive" } },
        { tags: { has: q.search } },
      ];
    }

    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(q.limit ?? 20)));

    const [total, problems] = await Promise.all([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        orderBy: [{ frequency: "desc" }, { title: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    let solvedKeys = new Set<string>();
    if (userId) {
      solvedKeys = await getUserSolvedKeys(userId);
    }

    let list = problems.map((p) => ({
      ...p,
      solved: solvedKeys.has(`${p.platform}:${p.externalId}`),
    }));

    if (q.solved === "true") list = list.filter((p) => p.solved);
    if (q.solved === "false") list = list.filter((p) => !p.solved);

    const allTags = await prisma.problem.findMany({ select: { tags: true } });
    const tagSet = new Set<string>();
    for (const p of allTags) for (const t of p.tags) tagSet.add(t);

    const allCompanies = await prisma.problem.findMany({
      select: { companies: true },
    });
    const companySet = new Set<string>();
    for (const p of allCompanies) for (const c of p.companies) companySet.add(c);

    return {
      problems: list,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      tags: Array.from(tagSet).sort(),
      companies: Array.from(companySet).sort(),
    };
  });

  // ─── Practice ─────────────────────────────────────────────────────
  app.get("/api/practice", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    const solvedKeys = await getUserSolvedKeys(auth.id);
    const sheets = await Promise.all(
      PRACTICE_SHEETS.map(async (sheet) => {
        const problems = await resolveProblemRefs(sheet.problems, solvedKeys);
        const completed = problems.filter((p) => p.solved).length;
        return {
          id: sheet.id,
          name: sheet.name,
          category: sheet.category,
          description: sheet.description,
          problems,
          completed,
          total: problems.length,
        };
      })
    );

    // Daily: unsolved mediums first
    const dailyPool = await prisma.problem.findMany({
      where: { difficulty: { in: ["EASY", "MEDIUM"] } },
      take: 40,
      orderBy: { frequency: "desc" },
    });
    const daily = dailyPool
      .filter((p) => !solvedKeys.has(`${p.platform}:${p.externalId}`))
      .slice(0, 5)
      .map((p) => ({
        ...p,
        solved: false,
        reason: "Recommended practice",
      }));

    return { sheets, daily };
  });

  // ─── Roadmaps ─────────────────────────────────────────────────────
  app.get("/api/roadmaps", async (req) => {
    const userId = optionalUserId(req);
    const solvedKeys = userId ? await getUserSolvedKeys(userId) : new Set<string>();
    const roadmaps = await prisma.roadmap.findMany({ orderBy: { order: "asc" } });

    return {
      roadmaps: await Promise.all(
        roadmaps.map(async (r) => {
          const nodes = r.nodes as {
            problems?: { platform: Platform; externalId: string }[];
          };
          const refs = nodes.problems ?? [];
          const problems = await resolveProblemRefs(refs, solvedKeys);
          const completed = problems.filter((p) => p.solved).length;
          const total = problems.length || 1;
          return {
            slug: r.slug,
            title: r.title,
            description: r.description,
            category: r.category,
            order: r.order,
            completed,
            total: problems.length,
            progress: Math.round((completed / total) * 100),
          };
        })
      ),
    };
  });

  app.get("/api/roadmaps/:slug", async (req, reply) => {
    const userId = optionalUserId(req);
    const { slug } = req.params as { slug: string };
    const roadmap = await prisma.roadmap.findUnique({ where: { slug } });
    if (!roadmap) return reply.status(404).send({ error: "Roadmap not found" });

    const solvedKeys = userId ? await getUserSolvedKeys(userId) : new Set<string>();
    const nodes = roadmap.nodes as {
      theory?: { title: string; url: string; source: string }[];
      videos?: { title: string; url: string }[];
      problems?: { platform: Platform; externalId: string }[];
    };

    const problems = await resolveProblemRefs(nodes.problems ?? [], solvedKeys);
    const completed = problems.filter((p) => p.solved).length;

    return {
      roadmap: {
        slug: roadmap.slug,
        title: roadmap.title,
        description: roadmap.description,
        category: roadmap.category,
        completed,
        total: problems.length,
        progress: problems.length
          ? Math.round((completed / problems.length) * 100)
          : 0,
      },
      theory: nodes.theory ?? [],
      videos: nodes.videos ?? [],
      problems,
    };
  });

  // ─── Companies ────────────────────────────────────────────────────
  app.get("/api/companies", async (req) => {
    const userId = optionalUserId(req);
    const solvedKeys = userId ? await getUserSolvedKeys(userId) : new Set<string>();

    const problems = await prisma.problem.findMany({
      where: { companies: { isEmpty: false } },
      orderBy: { frequency: "desc" },
    });

    const byCompany = new Map<
      string,
      {
        company: string;
        problems: typeof problems;
        easy: number;
        medium: number;
        hard: number;
        solved: number;
      }
    >();

    for (const p of problems) {
      for (const c of p.companies) {
        if (!byCompany.has(c)) {
          byCompany.set(c, {
            company: c,
            problems: [],
            easy: 0,
            medium: 0,
            hard: 0,
            solved: 0,
          });
        }
        const bucket = byCompany.get(c)!;
        bucket.problems.push(p);
        if (p.difficulty === "EASY") bucket.easy++;
        else if (p.difficulty === "MEDIUM") bucket.medium++;
        else bucket.hard++;
        if (solvedKeys.has(`${p.platform}:${p.externalId}`)) bucket.solved++;
      }
    }

    const companies = Array.from(byCompany.values())
      .map((c) => ({
        company: c.company,
        total: c.problems.length,
        easy: c.easy,
        medium: c.medium,
        hard: c.hard,
        solved: c.solved,
        trending: c.problems.some((p) => (p.frequency ?? 0) >= 90),
        problems: c.problems.map((p) => ({
          id: p.id,
          title: p.title,
          url: p.url,
          platform: p.platform,
          externalId: p.externalId,
          difficulty: p.difficulty,
          tags: p.tags,
          frequency: p.frequency,
          companies: p.companies,
          solved: solvedKeys.has(`${p.platform}:${p.externalId}`),
        })),
      }))
      .sort((a, b) => b.total - a.total);

    return { companies };
  });

  // ─── Goals ────────────────────────────────────────────────────────
  app.get("/api/goals", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const goals = await prisma.goal.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: "desc" },
    });
    return { goals, templates: GOAL_TEMPLATES };
  });

  app.post("/api/goals", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    try {
      const body = z
        .object({
          title: z.string().trim().min(1).max(120),
          description: z.string().trim().max(500).optional(),
          period: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
          target: z.number().int().min(1).max(10000),
          metric: z.string().trim().min(1).max(40),
          templateKey: z.string().optional(),
        })
        .parse(req.body);

      let title = body.title;
      let description = body.description;
      let period = body.period as GoalPeriod;
      let target = body.target;
      let metric = body.metric;

      if (body.templateKey) {
        const t = GOAL_TEMPLATES.find((x) => x.key === body.templateKey);
        if (t) {
          title = t.title;
          description = t.description;
          period = t.period;
          target = t.target;
          metric = t.metric;
        }
      }

      const endsAt = periodEnd(period);
      const goal = await prisma.goal.create({
        data: {
          userId: auth.id,
          title,
          description,
          period,
          target,
          metric,
          endsAt,
        },
      });
      return { goal };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: "Validation failed", issues: formatZod(err) });
      }
      throw err;
    }
  });

  app.patch("/api/goals/:id", async (req, reply) => {
    return updateGoalProgress(req, reply);
  });

  // POST alias — more reliable than PATCH behind some proxies/browsers
  app.post("/api/goals/:id/progress", async (req, reply) => {
    return updateGoalProgress(req, reply);
  });

  async function updateGoalProgress(
    req: Parameters<typeof requireUser>[0],
    reply: Parameters<typeof requireUser>[1]
  ) {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    try {
      const { id } = req.params as { id: string };
      const body = z
        .object({
          current: z.coerce.number().int().min(0).optional(),
          delta: z.coerce.number().int().optional(),
          isCompleted: z.boolean().optional(),
          title: z.string().trim().min(1).max(120).optional(),
        })
        .parse(req.body ?? {});

      const existing = await prisma.goal.findFirst({
        where: { id, userId: auth.id },
      });
      if (!existing) {
        return reply.status(404).send({ error: "Goal not found" });
      }

      let current = existing.current;
      if (typeof body.delta === "number") {
        current = Math.max(0, existing.current + body.delta);
      } else if (typeof body.current === "number") {
        current = body.current;
      }

      const isCompleted =
        body.isCompleted ?? current >= existing.target;

      const goal = await prisma.goal.update({
        where: { id },
        data: {
          current,
          isCompleted,
          ...(body.title ? { title: body.title } : {}),
        },
      });
      return { goal };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply
          .status(400)
          .send({ error: "Validation failed", issues: formatZod(err) });
      }
      req.log.error(err);
      return reply.status(500).send({ error: "Failed to update goal" });
    }
  }

  app.delete("/api/goals/:id", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { id } = req.params as { id: string };
    await prisma.goal.deleteMany({ where: { id, userId: auth.id } });
    return { ok: true };
  });

  // ─── Notes ────────────────────────────────────────────────────────
  app.get("/api/notes", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const notes = await prisma.note.findMany({
      where: { userId: auth.id },
      orderBy: { updatedAt: "desc" },
      include: { problem: { select: { title: true, url: true } } },
    });
    return {
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        tags: n.tags,
        problemId: n.problemId,
        problemTitle: n.problem?.title ?? null,
        problemUrl: n.problem?.url ?? null,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      })),
    };
  });

  app.post("/api/notes", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    try {
      const body = z
        .object({
          title: z.string().trim().min(1).max(200),
          content: z.string().min(1).max(50000),
          tags: z.array(z.string()).default([]),
          problemId: z.string().optional().nullable(),
        })
        .parse(req.body);

      const note = await prisma.note.create({
        data: {
          userId: auth.id,
          title: body.title,
          content: body.content,
          tags: body.tags,
          problemId: body.problemId || null,
        },
      });
      return { note };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: "Validation failed", issues: formatZod(err) });
      }
      throw err;
    }
  });

  app.patch("/api/notes/:id", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { id } = req.params as { id: string };
    const body = z
      .object({
        title: z.string().trim().min(1).max(200).optional(),
        content: z.string().min(1).max(50000).optional(),
        tags: z.array(z.string()).optional(),
      })
      .parse(req.body);

    const existing = await prisma.note.findFirst({
      where: { id, userId: auth.id },
    });
    if (!existing) return reply.status(404).send({ error: "Note not found" });

    const note = await prisma.note.update({ where: { id }, data: body });
    return { note };
  });

  app.delete("/api/notes/:id", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { id } = req.params as { id: string };
    await prisma.note.deleteMany({ where: { id, userId: auth.id } });
    return { ok: true };
  });

  // ─── Social / Friends ─────────────────────────────────────────────
  app.get("/api/friends", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    const [following, followers, invite] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: auth.id },
        include: {
          following: {
            include: { platformAccounts: true },
          },
        },
      }),
      prisma.follow.findMany({
        where: { followingId: auth.id },
        include: {
          follower: {
            include: { platformAccounts: true },
          },
        },
      }),
      prisma.inviteCode.findFirst({
        where: { userId: auth.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      following: following.map((f) => serializeSocialUser(f.following)),
      followers: followers.map((f) => serializeSocialUser(f.follower)),
      inviteCode: invite?.code ?? null,
    };
  });

  app.post("/api/friends/invite", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;

    try {
      const existing = await prisma.inviteCode.findFirst({
        where: { userId: auth.id },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        return {
          code: existing.code,
          link: `/friends?invite=${existing.code}`,
        };
      }

      const code = randomBytes(4).toString("hex");
      const invite = await prisma.inviteCode.create({
        data: { userId: auth.id, code },
      });
      return { code: invite.code, link: `/friends?invite=${invite.code}` };
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error:
          "Failed to create invite — ensure the database is migrated (InviteCode table)",
      });
    }
  });

  app.post("/api/friends/accept-invite", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    try {
      const body = (req.body ?? {}) as { code?: string };
      const parsed = z
        .object({ code: z.string().trim().min(4) })
        .parse({ code: body.code });
      const code = parsed.code.toLowerCase();

      const invite = await prisma.inviteCode.findFirst({
        where: {
          OR: [{ code: parsed.code }, { code }],
        },
      });
      if (!invite) {
        return reply.status(404).send({ error: "Invalid invite code" });
      }
      if (invite.userId === auth.id) {
        return reply.status(400).send({ error: "Cannot use your own invite" });
      }
      if (invite.uses >= invite.maxUses) {
        return reply.status(400).send({ error: "Invite link expired" });
      }

      // Mutual follow on invite accept
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: auth.id,
            followingId: invite.userId,
          },
        },
        create: { followerId: auth.id, followingId: invite.userId },
        update: {},
      });
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: invite.userId,
            followingId: auth.id,
          },
        },
        create: { followerId: invite.userId, followingId: auth.id },
        update: {},
      });
      await prisma.inviteCode.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } },
      });

      return { ok: true, friendId: invite.userId };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply
          .status(400)
          .send({ error: "Validation failed", issues: formatZod(err) });
      }
      req.log.error(err);
      return reply.status(500).send({ error: "Failed to accept invite" });
    }
  });

  app.post("/api/friends/follow", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { username } = z
      .object({ username: z.string().trim().min(1) })
      .parse(req.body);
    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (!target) return reply.status(404).send({ error: "User not found" });
    if (target.id === auth.id) {
      return reply.status(400).send({ error: "Cannot follow yourself" });
    }
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: auth.id,
          followingId: target.id,
        },
      },
      create: { followerId: auth.id, followingId: target.id },
      update: {},
    });
    return { ok: true };
  });

  app.delete("/api/friends/:username", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { username } = req.params as { username: string };
    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (!target) return reply.status(404).send({ error: "User not found" });
    await prisma.follow.deleteMany({
      where: { followerId: auth.id, followingId: target.id },
    });
    return { ok: true };
  });

  app.get("/api/leaderboard", async (req) => {
    const q = req.query as { scope?: string; userId?: string };
    const users = await prisma.user.findMany({
      orderBy: [{ xp: "desc" }, { streak: "desc" }],
      take: 50,
      include: { platformAccounts: true },
    });

    let list = users;
    if (q.scope === "friends" && q.userId) {
      const following = await prisma.follow.findMany({
        where: { followerId: q.userId },
        select: { followingId: true },
      });
      const ids = new Set([
        q.userId,
        ...following.map((f) => f.followingId),
      ]);
      list = users.filter((u) => ids.has(u.id));
    }

    return {
      leaderboard: list.map((u, i) => ({
        rank: i + 1,
        id: u.id,
        username: u.username,
        name: u.name ?? u.username,
        xp: u.xp,
        streak: u.streak,
        solved: u.platformAccounts.reduce((n, a) => n + a.solvedCount, 0),
        rating: Math.max(
          0,
          ...u.platformAccounts.map((a) => a.rating ?? 0)
        ),
        country: u.country,
        college: u.college,
      })),
      scope: q.scope ?? "global",
    };
  });

  // ─── Discussions ──────────────────────────────────────────────────
  app.get("/api/discussions", async () => {
    const discussions = await prisma.discussion.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { username: true, name: true } },
        _count: { select: { comments: true } },
      },
    });
    return {
      discussions: discussions.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        tags: d.tags,
        likes: d.likes,
        author: d.user.username,
        authorName: d.user.name,
        comments: d._count.comments,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
    };
  });

  app.post("/api/discussions", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    try {
      const body = z
        .object({
          title: z.string().trim().min(3).max(200),
          content: z.string().trim().min(1).max(20000),
          tags: z.array(z.string()).max(10).default([]),
        })
        .parse(req.body);

      const discussion = await prisma.discussion.create({
        data: {
          userId: auth.id,
          title: body.title,
          content: body.content,
          tags: body.tags,
        },
        include: {
          user: { select: { username: true, name: true } },
        },
      });
      return {
        discussion: {
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          tags: discussion.tags,
          likes: discussion.likes,
          author: discussion.user.username,
          comments: 0,
          createdAt: discussion.createdAt.toISOString(),
        },
      };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: "Validation failed", issues: formatZod(err) });
      }
      throw err;
    }
  });

  app.post("/api/discussions/:id/like", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { id } = req.params as { id: string };
    const discussion = await prisma.discussion.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
    return { likes: discussion.likes };
  });

  app.post("/api/discussions/:id/comments", async (req, reply) => {
    const auth = await requireUser(req, reply);
    if (!auth) return;
    const { id } = req.params as { id: string };
    const body = z
      .object({ content: z.string().trim().min(1).max(5000) })
      .parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        userId: auth.id,
        discussionId: id,
        content: body.content,
      },
    });
    return { comment };
  });

  app.get("/api/discussions/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, name: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { username: true, name: true } } },
        },
      },
    });
    if (!discussion) return reply.status(404).send({ error: "Not found" });
    return {
      discussion: {
        id: discussion.id,
        title: discussion.title,
        content: discussion.content,
        tags: discussion.tags,
        likes: discussion.likes,
        author: discussion.user.username,
        createdAt: discussion.createdAt.toISOString(),
        comments: discussion.comments.map((c) => ({
          id: c.id,
          content: c.content,
          author: c.user.username,
          createdAt: c.createdAt.toISOString(),
        })),
      },
    };
  });

  // ─── Profile ──────────────────────────────────────────────────────
  app.get("/api/profile/:username", async (req, reply) => {
    const { username } = req.params as { username: string };
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { platformAccounts: true },
    });
    if (!user) return reply.status(404).send({ error: "User not found" });
    if (!user.isPublic) {
      return reply.status(403).send({ error: "Profile is private" });
    }

    return {
      user: publicUser(user),
      accounts: user.platformAccounts.map(serializeAccount),
      stats: buildStats(user.platformAccounts, user),
      ratingHistory: mergeRatingHistory(user.platformAccounts),
      heatmap: mergeHeatmaps(user.platformAccounts),
    };
  });

  // ─── Search ───────────────────────────────────────────────────────
  app.get("/api/search", async (req) => {
    const q = ((req.query as { q?: string }).q ?? "").toLowerCase().trim();
    if (!q) return { results: [] };

    const [problems, roadmaps, users] = await Promise.all([
      prisma.problem.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { tags: { has: q } },
          ],
        },
        take: 8,
      }),
      prisma.roadmap.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    return {
      results: [
        ...problems.map((p) => ({
          type: "problem" as const,
          id: p.id,
          title: p.title,
          meta: p.platform,
          url: p.url,
        })),
        ...roadmaps.map((r) => ({
          type: "roadmap" as const,
          id: r.slug,
          title: r.title,
          meta: r.category,
        })),
        ...users.map((u) => ({
          type: "user" as const,
          id: u.id,
          title: u.name ?? u.username,
          meta: u.username,
        })),
      ],
      query: q,
    };
  });
}

// ─── Helpers ────────────────────────────────────────────────────────

function serializeAccount(a: {
  id: string;
  platform: Platform;
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  globalRank: number | null;
  solvedCount: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contests: number;
  acceptance: number | null;
  streak: number;
  lastSyncedAt: Date | null;
  metadata: unknown;
}) {
  return {
    id: a.id,
    platform: a.platform,
    handle: a.handle,
    rating: a.rating,
    maxRating: a.maxRating,
    rank: a.rank,
    globalRank: a.globalRank,
    solvedCount: a.solvedCount,
    easySolved: a.easySolved,
    mediumSolved: a.mediumSolved,
    hardSolved: a.hardSolved,
    contests: a.contests,
    acceptance: a.acceptance,
    streak: a.streak,
    lastSyncedAt: a.lastSyncedAt?.toISOString() ?? null,
  };
}

function serializeSocialUser(u: {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  country: string | null;
  college: string | null;
  xp: number;
  streak: number;
  platformAccounts: {
    solvedCount: number;
    rating: number | null;
  }[];
}) {
  return {
    id: u.id,
    username: u.username,
    name: u.name ?? u.username,
    avatarUrl: u.avatarUrl,
    country: u.country,
    college: u.college,
    xp: u.xp,
    streak: u.streak,
    solved: u.platformAccounts.reduce((n, a) => n + a.solvedCount, 0),
    rating: Math.max(0, ...u.platformAccounts.map((a) => a.rating ?? 0)),
  };
}

function buildStats(
  accounts: {
    solvedCount: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    rating: number | null;
    maxRating: number | null;
    contests: number;
    acceptance: number | null;
    streak: number;
  }[],
  user: { xp: number; level: number; streak: number; maxStreak: number } | null
) {
  const totalSolved = accounts.reduce((n, a) => n + a.solvedCount, 0);
  const easy = accounts.reduce((n, a) => n + a.easySolved, 0);
  const medium = accounts.reduce((n, a) => n + a.mediumSolved, 0);
  const hard = accounts.reduce((n, a) => n + a.hardSolved, 0);
  const ratings = accounts.map((a) => a.rating ?? 0).filter(Boolean);
  const peaks = accounts.map((a) => a.maxRating ?? 0).filter(Boolean);
  return {
    totalSolved,
    easy,
    medium,
    hard,
    currentRating: ratings.length ? Math.max(...ratings) : 0,
    peakRating: peaks.length ? Math.max(...peaks) : 0,
    contestsAttended: accounts.reduce((n, a) => n + a.contests, 0),
    averageRank: 0,
    streak: user?.streak ?? Math.max(0, ...accounts.map((a) => a.streak), 0),
    maxStreak: user?.maxStreak ?? 0,
    acceptance:
      accounts.find((a) => a.acceptance != null)?.acceptance ??
      0,
    activeDays: 0,
    xp: user?.xp ?? 0,
    level: user?.level ?? 1,
  };
}

async function resolveProblemRefs(
  refs: { platform: Platform; externalId: string }[],
  solvedKeys: Set<string>
) {
  const out = [];
  for (const ref of refs) {
    const p = await prisma.problem.findUnique({
      where: {
        platform_externalId: {
          platform: ref.platform,
          externalId: ref.externalId,
        },
      },
    });
    if (!p) continue;
    out.push({
      id: p.id,
      title: p.title,
      url: p.url,
      platform: p.platform,
      externalId: p.externalId,
      difficulty: p.difficulty,
      tags: p.tags,
      rating: p.rating,
      companies: p.companies,
      solved: solvedKeys.has(`${p.platform}:${p.externalId}`),
    });
  }
  return out;
}

function periodEnd(period: GoalPeriod): Date {
  const d = new Date();
  if (period === "DAILY") {
    d.setHours(23, 59, 59, 999);
  } else if (period === "WEEKLY") {
    d.setDate(d.getDate() + (7 - d.getDay()));
    d.setHours(23, 59, 59, 999);
  } else {
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
  }
  return d;
}


