export type ContestItem = {
  id: string;
  platform: string;
  name: string;
  url: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  status: "UPCOMING" | "LIVE" | "ENDED";
  difficulty: string | null;
  virtualAvail: boolean;
  participants: number | null;
};

const SITE_TO_PLATFORM: Record<string, string> = {
  codeforces: "CODEFORCES",
  codechef: "CODECHEF",
  leetcode: "LEETCODE",
  atcoder: "ATCODER",
  hackerrank: "HACKERRANK",
  hackerearth: "HACKEREARTH",
  topcoder: "TOPCODER",
  "kick start": "KICKSTART",
  geeksforgeeks: "GFG",
  gfg: "GFG",
  codingninjas: "CODING_NINJAS",
};

function statusFromTimes(startMs: number, endMs: number): ContestItem["status"] {
  const now = Date.now();
  if (now >= startMs && now < endMs) return "LIVE";
  if (now >= endMs) return "ENDED";
  return "UPCOMING";
}

async function fetchCompeteApi(): Promise<ContestItem[]> {
  const res = await fetch("https://competeapi.vercel.app/contests/upcoming/", {
    headers: { "User-Agent": "CP-Hub/1.0" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`competeapi ${res.status}`);
  const data = (await res.json()) as {
    site: string;
    title: string;
    startTime: number;
    duration: number;
    endTime: number;
    url: string;
  }[];

  return data.map((c, i) => {
    const site = (c.site || "").toLowerCase();
    const platform = SITE_TO_PLATFORM[site] || site.toUpperCase() || "OTHER";
    const startMs = Number(c.startTime);
    const endMs = Number(c.endTime);
    return {
      id: `ca-${platform}-${startMs}-${i}`,
      platform,
      name: c.title,
      url: c.url,
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
      durationMin: Math.max(1, Math.round(Number(c.duration) / 60000)),
      status: statusFromTimes(startMs, endMs),
      difficulty: null,
      virtualAvail: true,
      participants: null,
    };
  });
}

async function fetchCodeforces(): Promise<ContestItem[]> {
  const res = await fetch("https://codeforces.com/api/contest.list", {
    headers: { "User-Agent": "CP-Hub/1.0" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`codeforces ${res.status}`);
  const data = (await res.json()) as {
    status: string;
    result: {
      id: number;
      name: string;
      phase: string;
      startTimeSeconds: number;
      durationSeconds: number;
    }[];
  };
  if (data.status !== "OK") return [];

  return data.result
    .filter((c) => c.phase === "BEFORE" || c.phase === "CODING")
    .slice(0, 40)
    .map((c) => {
      const startMs = c.startTimeSeconds * 1000;
      const endMs = startMs + c.durationSeconds * 1000;
      return {
        id: `cf-${c.id}`,
        platform: "CODEFORCES",
        name: c.name,
        url: `https://codeforces.com/contest/${c.id}`,
        startTime: new Date(startMs).toISOString(),
        endTime: new Date(endMs).toISOString(),
        durationMin: Math.round(c.durationSeconds / 60),
        status: statusFromTimes(startMs, endMs),
        difficulty: null,
        virtualAvail: true,
        participants: null,
      };
    });
}

async function fetchLeetCodeContests(): Promise<ContestItem[]> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CP-Hub/1.0",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query: `
          query {
            allContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: {
        allContests?: {
          title: string;
          titleSlug: string;
          startTime: number;
          duration: number;
        }[];
      };
    };
    const nowSec = Date.now() / 1000;
    return (json.data?.allContests ?? [])
      .filter((c) => c.startTime + c.duration > nowSec)
      .slice(0, 20)
      .map((c) => {
        const startMs = c.startTime * 1000;
        const endMs = (c.startTime + c.duration) * 1000;
        return {
          id: `lc-${c.titleSlug}`,
          platform: "LEETCODE",
          name: c.title,
          url: `https://leetcode.com/contest/${c.titleSlug}/`,
          startTime: new Date(startMs).toISOString(),
          endTime: new Date(endMs).toISOString(),
          durationMin: Math.round(c.duration / 60),
          status: statusFromTimes(startMs, endMs),
          difficulty: null,
          virtualAvail: true,
          participants: null,
        };
      });
  } catch {
    return [];
  }
}

/** Merge multi-platform upcoming/live contests */
export async function fetchAllUpcomingContests(limit = 80): Promise<ContestItem[]> {
  const results = await Promise.allSettled([
    fetchCompeteApi(),
    fetchCodeforces(),
    fetchLeetCodeContests(),
  ]);

  const merged: ContestItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") merged.push(...r.value);
  }

  // Dedupe by name+start day
  const seen = new Set<string>();
  const unique: ContestItem[] = [];
  for (const c of merged) {
    const key = `${c.platform}|${c.name.toLowerCase()}|${c.startTime.slice(0, 13)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }

  unique.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return unique
    .filter((c) => c.status === "UPCOMING" || c.status === "LIVE")
    .slice(0, limit);
}
