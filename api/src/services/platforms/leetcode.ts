type LcProfile = {
  matchedUser: {
    username: string;
    profile: {
      ranking: number;
      userAvatar: string | null;
      realName: string | null;
    };
    submitStatsGlobal: {
      acSubmissionNum: { difficulty: string; count: number }[];
    };
  } | null;
  userContestRanking: {
    rating: number;
    globalRanking: number;
    topPercentage: number;
    attendedContestsCount: number;
  } | null;
};

type LcRecent = {
  recentAcSubmissionList: {
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
  }[];
};

type LcCalendar = {
  matchedUser: {
    userCalendar: {
      submissionCalendar: string; // JSON map date->count
    };
  } | null;
};

async function lcGraphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "CP-Hub/1.0",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`LeetCode API HTTP ${res.status}`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!json.data) throw new Error("LeetCode returned empty data");
  return json.data;
}

export async function fetchLcUser(username: string) {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile { ranking userAvatar realName }
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        topPercentage
        attendedContestsCount
      }
    }
  `;
  const data = await lcGraphql<LcProfile>(query, { username });
  if (!data.matchedUser) throw new Error("LeetCode username not found");
  return data;
}

export async function fetchLcRecentAc(username: string, limit = 50) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id title titleSlug timestamp
      }
    }
  `;
  return lcGraphql<LcRecent>(query, { username, limit });
}

export async function fetchLcCalendar(username: string) {
  const query = `
    query userProfileCalendar($username: String!) {
      matchedUser(username: $username) {
        userCalendar { submissionCalendar }
      }
    }
  `;
  return lcGraphql<LcCalendar>(query, { username });
}

export function lcProblemUrl(slug: string) {
  return `https://leetcode.com/problems/${slug}/`;
}

export function mapLcDifficulty(d: string): "EASY" | "MEDIUM" | "HARD" {
  const u = d.toUpperCase();
  if (u === "EASY") return "EASY";
  if (u === "HARD") return "HARD";
  return "MEDIUM";
}
