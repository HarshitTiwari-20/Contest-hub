export type CfUserInfo = {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
};

export type CfSubmission = {
  id: number;
  creationTimeSeconds: number;
  programmingLanguage: string;
  verdict?: string;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
  };
};

export type CfRatingChange = {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
};

export type CfProblem = {
  contestId?: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
};

async function cfApi<T>(path: string): Promise<T> {
  const res = await fetch(`https://codeforces.com/api/${path}`, {
    headers: { "User-Agent": "CP-Hub/1.0" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`Codeforces API HTTP ${res.status}`);
  }
  const data = (await res.json()) as { status: string; comment?: string; result: T };
  if (data.status !== "OK") {
    throw new Error(data.comment || "Codeforces API error");
  }
  return data.result;
}

export async function fetchCfUser(handle: string): Promise<CfUserInfo> {
  const users = await cfApi<CfUserInfo[]>(
    `user.info?handles=${encodeURIComponent(handle)}`
  );
  if (!users[0]) throw new Error("Codeforces handle not found");
  return users[0];
}

export async function fetchCfSubmissions(
  handle: string,
  count = 2000
): Promise<CfSubmission[]> {
  return cfApi<CfSubmission[]>(
    `user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`
  );
}

export async function fetchCfRating(handle: string): Promise<CfRatingChange[]> {
  try {
    return await cfApi<CfRatingChange[]>(
      `user.rating?handle=${encodeURIComponent(handle)}`
    );
  } catch {
    return [];
  }
}

export async function fetchCfProblemset(): Promise<CfProblem[]> {
  const result = await cfApi<{ problems: CfProblem[] }>("problemset.problems");
  return result.problems;
}

export function cfProblemUrl(contestId: number | undefined, index: string) {
  if (!contestId) return `https://codeforces.com/problemset`;
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

export function cfExternalId(contestId: number | undefined, index: string) {
  return contestId ? `${contestId}${index}` : index;
}

export function mapCfVerdict(verdict?: string): string {
  switch (verdict) {
    case "OK":
      return "AC";
    case "WRONG_ANSWER":
      return "WA";
    case "TIME_LIMIT_EXCEEDED":
      return "TLE";
    case "MEMORY_LIMIT_EXCEEDED":
      return "MLE";
    case "RUNTIME_ERROR":
      return "RE";
    case "COMPILATION_ERROR":
      return "CE";
    case "PARTIAL":
      return "PARTIAL";
    default:
      return "PENDING";
  }
}

export function mapCfDifficulty(rating?: number): "EASY" | "MEDIUM" | "HARD" | "EXPERT" {
  if (!rating) return "MEDIUM";
  if (rating < 1200) return "EASY";
  if (rating < 1600) return "MEDIUM";
  if (rating < 2000) return "HARD";
  return "EXPERT";
}
