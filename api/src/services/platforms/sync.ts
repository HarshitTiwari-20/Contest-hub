import { prisma } from "../../lib/prisma.js";
import type { Platform, Verdict, Difficulty } from "../../generated/prisma/client.js";
import {
  fetchCfUser,
  fetchCfSubmissions,
  fetchCfRating,
  cfProblemUrl,
  cfExternalId,
  mapCfVerdict,
  mapCfDifficulty,
} from "./codeforces.js";
import {
  fetchLcUser,
  fetchLcRecentAc,
  fetchLcCalendar,
  lcProblemUrl,
} from "./leetcode.js";

export async function syncPlatformAccount(
  userId: string,
  platform: Platform,
  handle: string
) {
  const normalized = handle.trim();
  if (!normalized) throw new Error("Handle is required");

  if (platform === "CODEFORCES") {
    return syncCodeforces(userId, normalized);
  }
  if (platform === "LEETCODE") {
    return syncLeetcode(userId, normalized);
  }

  const account = await prisma.platformAccount.upsert({
    where: { userId_platform: { userId, platform } },
    create: {
      userId,
      platform,
      handle: normalized,
      lastSyncedAt: new Date(),
      metadata: {
        note: "Connected — full stats sync not yet available for this platform",
      },
    },
    update: {
      handle: normalized,
      lastSyncedAt: new Date(),
    },
  });
  return account;
}

async function syncCodeforces(userId: string, handle: string) {
  // 1) Validate handle quickly and save account shell first
  let info;
  try {
    info = await fetchCfUser(handle);
  } catch (e) {
    throw new Error(
      e instanceof Error
        ? `Codeforces: ${e.message}`
        : "Codeforces handle not found"
    );
  }

  // Save minimal account immediately so UI shows connected even if later steps fail
  await prisma.platformAccount.upsert({
    where: { userId_platform: { userId, platform: "CODEFORCES" } },
    create: {
      userId,
      platform: "CODEFORCES",
      handle: info.handle,
      rating: info.rating ?? null,
      maxRating: info.maxRating ?? null,
      rank: info.rank ?? null,
      lastSyncedAt: new Date(),
    },
    update: {
      handle: info.handle,
      rating: info.rating ?? null,
      maxRating: info.maxRating ?? null,
      rank: info.rank ?? null,
      lastSyncedAt: new Date(),
    },
  });

  const [subs, ratingHistory] = await Promise.all([
    fetchCfSubmissions(handle, 1000).catch(() => [] as Awaited<
      ReturnType<typeof fetchCfSubmissions>
    >),
    fetchCfRating(handle).catch(() => [] as Awaited<ReturnType<typeof fetchCfRating>>),
  ]);

  const acSubs = subs.filter((s) => s.verdict === "OK");
  const solvedKeys = new Set<string>();
  for (const s of acSubs) {
    if (!s.problem?.index) continue;
    solvedKeys.add(cfExternalId(s.problem.contestId, s.problem.index));
  }

  // Limit work: only process recent submissions for DB rows
  const recent = subs.filter((s) => s.problem?.index).slice(0, 120);

  // Unique problems from recent
  const uniqueProblems = new Map<
    string,
    { contestId?: number; index: string; name: string; rating?: number; tags: string[] }
  >();
  for (const s of recent) {
    const key = cfExternalId(s.problem.contestId, s.problem.index);
    if (!uniqueProblems.has(key)) {
      uniqueProblems.set(key, {
        contestId: s.problem.contestId,
        index: s.problem.index,
        name: s.problem.name,
        rating: s.problem.rating,
        tags: s.problem.tags ?? [],
      });
    }
  }

  const problemIdByKey = new Map<string, string>();
  // Upsert problems in parallel batches
  const problemEntries = Array.from(uniqueProblems.entries());
  for (let i = 0; i < problemEntries.length; i += 20) {
    const batch = problemEntries.slice(i, i + 20);
    await Promise.all(
      batch.map(async ([key, p]) => {
        const difficulty = mapCfDifficulty(p.rating) as Difficulty;
        const row = await prisma.problem.upsert({
          where: {
            platform_externalId: { platform: "CODEFORCES", externalId: key },
          },
          create: {
            platform: "CODEFORCES",
            externalId: key,
            title: p.name,
            url: cfProblemUrl(p.contestId, p.index),
            difficulty,
            rating: p.rating ?? null,
            tags: p.tags ?? [],
            companies: [],
          },
          update: {
            title: p.name,
            url: cfProblemUrl(p.contestId, p.index),
            difficulty,
            rating: p.rating ?? null,
            tags: p.tags ?? [],
          },
        });
        problemIdByKey.set(key, row.id);
      })
    );
  }

  await prisma.submission.deleteMany({
    where: { userId, platform: "CODEFORCES" },
  });

  const submissionRows = recent
    .map((s) => {
      const key = cfExternalId(s.problem.contestId, s.problem.index);
      const problemId = problemIdByKey.get(key);
      if (!problemId) return null;
      return {
        userId,
        problemId,
        platform: "CODEFORCES" as const,
        verdict: mapCfVerdict(s.verdict) as Verdict,
        language: (s.programmingLanguage || "Unknown").slice(0, 80),
        submittedAt: new Date(s.creationTimeSeconds * 1000),
      };
    })
    .filter(Boolean) as {
    userId: string;
    problemId: string;
    platform: "CODEFORCES";
    verdict: Verdict;
    language: string;
    submittedAt: Date;
  }[];

  if (submissionRows.length) {
    // createMany in chunks
    for (let i = 0; i < submissionRows.length; i += 50) {
      await prisma.submission.createMany({
        data: submissionRows.slice(i, i + 50),
      });
    }
  }

  const heatmap: Record<string, number> = {};
  for (const s of acSubs) {
    const day = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    heatmap[day] = (heatmap[day] ?? 0) + 1;
  }

  const ratings = ratingHistory.map((r) => ({
    date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10),
    rating: r.newRating,
    contest: r.contestName,
    rank: r.rank,
    delta: r.newRating - r.oldRating,
  }));

  const streak = computeStreak(Object.keys(heatmap).sort());

  const account = await prisma.platformAccount.upsert({
    where: { userId_platform: { userId, platform: "CODEFORCES" } },
    create: {
      userId,
      platform: "CODEFORCES",
      handle: info.handle,
      rating: info.rating ?? null,
      maxRating: info.maxRating ?? null,
      rank: info.rank ?? null,
      solvedCount: solvedKeys.size,
      contests: ratingHistory.length,
      streak,
      lastSyncedAt: new Date(),
      metadata: {
        heatmap,
        ratingHistory: ratings,
        solvedKeys: Array.from(solvedKeys),
        maxRank: info.maxRank,
      },
    },
    update: {
      handle: info.handle,
      rating: info.rating ?? null,
      maxRating: info.maxRating ?? null,
      rank: info.rank ?? null,
      solvedCount: solvedKeys.size,
      contests: ratingHistory.length,
      streak,
      lastSyncedAt: new Date(),
      metadata: {
        heatmap,
        ratingHistory: ratings,
        solvedKeys: Array.from(solvedKeys),
        maxRank: info.maxRank,
      },
    },
  });

  await recomputeUserStats(userId);
  return account;
}

async function syncLeetcode(userId: string, username: string) {
  let profile;
  try {
    profile = await fetchLcUser(username);
  } catch (e) {
    throw new Error(
      e instanceof Error ? `LeetCode: ${e.message}` : "LeetCode username not found"
    );
  }

  if (!profile.matchedUser) {
    throw new Error("LeetCode username not found");
  }

  // Save shell first
  await prisma.platformAccount.upsert({
    where: { userId_platform: { userId, platform: "LEETCODE" } },
    create: {
      userId,
      platform: "LEETCODE",
      handle: profile.matchedUser.username,
      lastSyncedAt: new Date(),
    },
    update: {
      handle: profile.matchedUser.username,
      lastSyncedAt: new Date(),
    },
  });

  const [recent, calendar] = await Promise.all([
    fetchLcRecentAc(username, 40).catch(() => ({
      recentAcSubmissionList: [] as {
        id: string;
        title: string;
        titleSlug: string;
        timestamp: string;
      }[],
    })),
    fetchLcCalendar(username).catch(() => null),
  ]);

  const acStats = profile.matchedUser.submitStatsGlobal.acSubmissionNum;
  const easy = acStats.find((x) => x.difficulty === "Easy")?.count ?? 0;
  const medium = acStats.find((x) => x.difficulty === "Medium")?.count ?? 0;
  const hard = acStats.find((x) => x.difficulty === "Hard")?.count ?? 0;
  const all =
    acStats.find((x) => x.difficulty === "All")?.count ?? easy + medium + hard;

  const contest = profile.userContestRanking;
  const rating = contest ? Math.round(contest.rating) : null;

  await prisma.submission.deleteMany({
    where: { userId, platform: "LEETCODE" },
  });

  const solvedKeys: string[] = [];
  const list = recent.recentAcSubmissionList.slice(0, 40);

  // Batch problem upserts
  for (let i = 0; i < list.length; i += 10) {
    const batch = list.slice(i, i + 10);
    await Promise.all(
      batch.map(async (s) => {
        solvedKeys.push(s.titleSlug);
        const problem = await prisma.problem.upsert({
          where: {
            platform_externalId: {
              platform: "LEETCODE",
              externalId: s.titleSlug,
            },
          },
          create: {
            platform: "LEETCODE",
            externalId: s.titleSlug,
            title: s.title,
            url: lcProblemUrl(s.titleSlug),
            difficulty: "MEDIUM",
            tags: [],
            companies: [],
          },
          update: {
            title: s.title,
            url: lcProblemUrl(s.titleSlug),
          },
        });

        await prisma.submission.create({
          data: {
            userId,
            problemId: problem.id,
            platform: "LEETCODE",
            verdict: "AC",
            language: "Unknown",
            submittedAt: new Date(Number(s.timestamp) * 1000),
          },
        });
      })
    );
  }

  const heatmap: Record<string, number> = {};
  if (calendar?.matchedUser?.userCalendar?.submissionCalendar) {
    try {
      const raw = JSON.parse(
        calendar.matchedUser.userCalendar.submissionCalendar
      ) as Record<string, number>;
      for (const [ts, count] of Object.entries(raw)) {
        const day = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
        heatmap[day] = (heatmap[day] ?? 0) + count;
      }
    } catch {
      /* ignore */
    }
  }

  const streak = computeStreak(Object.keys(heatmap).sort());

  const account = await prisma.platformAccount.upsert({
    where: { userId_platform: { userId, platform: "LEETCODE" } },
    create: {
      userId,
      platform: "LEETCODE",
      handle: profile.matchedUser.username,
      rating,
      maxRating: rating,
      rank: contest ? `Top ${contest.topPercentage.toFixed(1)}%` : null,
      globalRank: contest?.globalRanking ?? profile.matchedUser.profile.ranking,
      solvedCount: all,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      contests: contest?.attendedContestsCount ?? 0,
      streak,
      lastSyncedAt: new Date(),
      metadata: {
        heatmap,
        ratingHistory: rating
          ? [{ date: new Date().toISOString().slice(0, 10), rating }]
          : [],
        solvedKeys,
        avatar: profile.matchedUser.profile.userAvatar,
      },
    },
    update: {
      handle: profile.matchedUser.username,
      rating,
      maxRating: rating,
      rank: contest ? `Top ${contest.topPercentage.toFixed(1)}%` : null,
      globalRank: contest?.globalRanking ?? profile.matchedUser.profile.ranking,
      solvedCount: all,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      contests: contest?.attendedContestsCount ?? 0,
      streak,
      lastSyncedAt: new Date(),
      metadata: {
        heatmap,
        ratingHistory: rating
          ? [{ date: new Date().toISOString().slice(0, 10), rating }]
          : [],
        solvedKeys,
        avatar: profile.matchedUser.profile.userAvatar,
      },
    },
  });

  await recomputeUserStats(userId);
  return account;
}

function dayBefore(isoDate: string): string {
  const ms: number = Date.parse(`${isoDate}T12:00:00.000Z`) - 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function computeStreak(sortedDays: string[]): number {
  if (!sortedDays.length) return 0;
  const set = new Set(sortedDays);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = dayBefore(today);

  let cursor: string | null = set.has(today)
    ? today
    : set.has(yesterday)
      ? yesterday
      : null;
  if (!cursor) return 0;

  let streak = 0;
  while (cursor && set.has(cursor)) {
    streak += 1;
    cursor = dayBefore(cursor);
  }
  return streak;
}

export async function recomputeUserStats(userId: string) {
  const accounts = await prisma.platformAccount.findMany({ where: { userId } });
  const totalSolved = accounts.reduce((n, a) => n + a.solvedCount, 0);
  const streak = Math.max(0, ...accounts.map((a) => a.streak), 0);
  const xp = totalSolved * 10 + accounts.reduce((n, a) => n + a.contests * 25, 0);
  const level = Math.max(1, Math.floor(xp / 500) + 1);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.user.update({
    where: { id: userId },
    data: {
      streak,
      maxStreak: Math.max(user?.maxStreak ?? 0, streak),
      xp,
      level,
      lastActiveAt: new Date(),
    },
  });
}

export async function getUserSolvedKeys(userId: string): Promise<Set<string>> {
  const accounts = await prisma.platformAccount.findMany({ where: { userId } });
  const keys = new Set<string>();
  for (const a of accounts) {
    const meta = a.metadata as { solvedKeys?: string[] } | null;
    for (const k of meta?.solvedKeys ?? []) {
      keys.add(`${a.platform}:${k}`);
    }
  }
  const ac = await prisma.submission.findMany({
    where: { userId, verdict: "AC" },
    include: { problem: { select: { platform: true, externalId: true } } },
  });
  for (const s of ac) {
    keys.add(`${s.problem.platform}:${s.problem.externalId}`);
  }
  return keys;
}

export function mergeHeatmaps(
  accounts: { metadata: unknown }[]
): { date: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const a of accounts) {
    const meta = a.metadata as { heatmap?: Record<string, number> } | null;
    if (!meta?.heatmap) continue;
    for (const [day, count] of Object.entries(meta.heatmap)) {
      map[day] = (map[day] ?? 0) + count;
    }
  }
  const days = 365;
  const out: { date: string; count: number }[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    const key = x.toISOString().slice(0, 10);
    out.push({ date: key, count: map[key] ?? 0 });
  }
  return out;
}

export function mergeRatingHistory(
  accounts: { platform: string; metadata: unknown; rating: number | null }[]
): { date: string; rating: number; platform?: string }[] {
  const points: { date: string; rating: number; platform?: string }[] = [];
  for (const a of accounts) {
    const meta = a.metadata as {
      ratingHistory?: { date: string; rating: number }[];
    } | null;
    for (const p of meta?.ratingHistory ?? []) {
      points.push({ ...p, platform: a.platform });
    }
  }
  points.sort((a, b) => a.date.localeCompare(b.date));
  return points;
}
