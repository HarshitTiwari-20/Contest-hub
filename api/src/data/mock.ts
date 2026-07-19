export type Platform =
  | "LEETCODE"
  | "CODEFORCES"
  | "CODECHEF"
  | "ATCODER"
  | "GFG"
  | "HACKERRANK"
  | "HACKEREARTH"
  | "CODING_NINJAS"
  | "CSES"
  | "TOPCODER"
  | "KICKSTART"
  | "META_HC"
  | "ICPC"
  | "AOC"
  | "GITHUB";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";
export type Verdict = "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE" | "PARTIAL" | "PENDING";

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

export const demoUser = {
  id: "user_demo",
  email: "alex@cphub.dev",
  username: "alexchen",
  name: "Alex Chen",
  bio: "Competitive programmer · Specialist on CF · Building cool things",
  avatarUrl: null,
  country: "India",
  college: "IIT Delhi",
  githubUrl: "https://github.com/alexchen",
  linkedinUrl: "https://linkedin.com/in/alexchen",
  portfolioUrl: "https://alexchen.dev",
  favoriteLang: "C++",
  favoritePlat: "CODEFORCES" as Platform,
  isPublic: true,
  xp: 12450,
  level: 28,
  coins: 890,
  streak: 47,
  maxStreak: 89,
  lastActiveAt: new Date().toISOString(),
};

export const platformAccounts = [
  {
    platform: "CODEFORCES" as Platform,
    handle: "alexchen",
    rating: 1624,
    maxRating: 1712,
    rank: "Specialist",
    globalRank: 18420,
    solvedCount: 842,
    easySolved: 210,
    mediumSolved: 412,
    hardSolved: 220,
    contests: 86,
    acceptance: 62.4,
    streak: 12,
    badges: ["Specialist", "1000+ problems"],
  },
  {
    platform: "LEETCODE" as Platform,
    handle: "alexchen",
    rating: 1842,
    maxRating: 1910,
    rank: "Knight",
    globalRank: 12400,
    solvedCount: 612,
    easySolved: 198,
    mediumSolved: 320,
    hardSolved: 94,
    contests: 42,
    acceptance: 71.2,
    streak: 47,
    badges: ["Knight", "50 Day Streak", "Annual Badge 2025"],
  },
  {
    platform: "CODECHEF" as Platform,
    handle: "alex_chen",
    rating: 1788,
    maxRating: 1856,
    rank: "4★",
    globalRank: 8900,
    solvedCount: 320,
    easySolved: 90,
    mediumSolved: 150,
    hardSolved: 80,
    contests: 38,
    acceptance: 58.1,
    streak: 5,
    badges: ["4 Star"],
  },
  {
    platform: "ATCODER" as Platform,
    handle: "alexchen",
    rating: 1240,
    maxRating: 1310,
    rank: "Green",
    globalRank: 22000,
    solvedCount: 186,
    easySolved: 60,
    mediumSolved: 90,
    hardSolved: 36,
    contests: 24,
    acceptance: 54.0,
    streak: 3,
    badges: ["Green"],
  },
  {
    platform: "GITHUB" as Platform,
    handle: "alexchen",
    rating: null,
    maxRating: null,
    rank: null,
    globalRank: null,
    solvedCount: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    contests: 0,
    acceptance: null,
    streak: 120,
    badges: ["Pro"],
  },
];

export const contests = [
  {
    id: "c1",
    platform: "CODEFORCES" as Platform,
    name: "Codeforces Round 1000 (Div. 2)",
    url: "https://codeforces.com/contests",
    startTime: new Date(now + 6 * hour).toISOString(),
    endTime: new Date(now + 8.5 * hour).toISOString(),
    durationMin: 150,
    status: "UPCOMING",
    difficulty: "Div. 2",
    ratingMin: 0,
    ratingMax: 2099,
    virtualAvail: true,
    participants: 28000,
  },
  {
    id: "c2",
    platform: "LEETCODE" as Platform,
    name: "Weekly Contest 420",
    url: "https://leetcode.com/contest",
    startTime: new Date(now + 30 * hour).toISOString(),
    endTime: new Date(now + 31.5 * hour).toISOString(),
    durationMin: 90,
    status: "UPCOMING",
    difficulty: "Weekly",
    ratingMin: null,
    ratingMax: null,
    virtualAvail: true,
    participants: 22000,
  },
  {
    id: "c3",
    platform: "ATCODER" as Platform,
    name: "AtCoder Beginner Contest 380",
    url: "https://atcoder.jp",
    startTime: new Date(now + 48 * hour).toISOString(),
    endTime: new Date(now + 50 * hour).toISOString(),
    durationMin: 100,
    status: "UPCOMING",
    difficulty: "ABC",
    ratingMin: 0,
    ratingMax: 1999,
    virtualAvail: true,
    participants: 12000,
  },
  {
    id: "c4",
    platform: "CODECHEF" as Platform,
    name: "Starters 160",
    url: "https://codechef.com",
    startTime: new Date(now + 3 * day).toISOString(),
    endTime: new Date(now + 3 * day + 3 * hour).toISOString(),
    durationMin: 180,
    status: "UPCOMING",
    difficulty: "Starters",
    ratingMin: null,
    ratingMax: null,
    virtualAvail: true,
    participants: 15000,
  },
  {
    id: "c5",
    platform: "CODEFORCES" as Platform,
    name: "Educational Codeforces Round 175",
    url: "https://codeforces.com",
    startTime: new Date(now - 2 * hour).toISOString(),
    endTime: new Date(now + 0.5 * hour).toISOString(),
    durationMin: 120,
    status: "LIVE",
    difficulty: "Educational",
    ratingMin: 0,
    ratingMax: null,
    virtualAvail: true,
    participants: 31000,
  },
  {
    id: "c6",
    platform: "LEETCODE" as Platform,
    name: "Biweekly Contest 145",
    url: "https://leetcode.com",
    startTime: new Date(now - 5 * day).toISOString(),
    endTime: new Date(now - 5 * day + 1.5 * hour).toISOString(),
    durationMin: 90,
    status: "ENDED",
    difficulty: "Biweekly",
    ratingMin: null,
    ratingMax: null,
    virtualAvail: true,
    participants: 18000,
  },
  {
    id: "c7",
    platform: "GFG" as Platform,
    name: "GFG Weekly Coding Contest 180",
    url: "https://geeksforgeeks.org",
    startTime: new Date(now + 4 * day).toISOString(),
    endTime: new Date(now + 4 * day + 2.5 * hour).toISOString(),
    durationMin: 150,
    status: "UPCOMING",
    difficulty: "Weekly",
    ratingMin: null,
    ratingMax: null,
    virtualAvail: false,
    participants: 8000,
  },
  {
    id: "c8",
    platform: "HACKERRANK" as Platform,
    name: "HackerRank Weekly Challenge",
    url: "https://hackerrank.com",
    startTime: new Date(now + 5 * day).toISOString(),
    endTime: new Date(now + 12 * day).toISOString(),
    durationMin: 10080,
    status: "UPCOMING",
    difficulty: "Open",
    ratingMin: null,
    ratingMax: null,
    virtualAvail: false,
    participants: 5000,
  },
];

const topics = [
  "Binary Search",
  "Greedy",
  "DP",
  "Graph",
  "Tree",
  "Trie",
  "Math",
  "Simulation",
  "Segment Tree",
  "Bitmask",
  "Backtracking",
  "Geometry",
  "String",
  "DFS",
  "BFS",
  "Two Pointers",
  "Sliding Window",
  "Linked List",
  "Heap",
  "Union Find",
  "Stack",
  "Queue",
  "Implementation",
  "Sort",
  "Number Theory",
];

const companies = [
  "Amazon",
  "Google",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Adobe",
  "Uber",
  "Atlassian",
  "LinkedIn",
  "Flipkart",
  "Goldman Sachs",
];

const problemTitles = [
  "Two Sum",
  "Longest Substring Without Repeating",
  "Median of Two Sorted Arrays",
  "Valid Parentheses",
  "Merge K Sorted Lists",
  "Word Ladder",
  "Course Schedule",
  "Number of Islands",
  "Serialize and Deserialize Binary Tree",
  "Trapping Rain Water",
  "Edit Distance",
  "Maximum Subarray",
  "Climbing Stairs",
  "Coin Change",
  "House Robber",
  "Unique Paths",
  "Longest Increasing Subsequence",
  "Word Break",
  "Palindrome Partitioning",
  "N-Queens",
  "Sudoku Solver",
  "Combination Sum",
  "Permutations",
  "Subsets",
  "Next Greater Element",
  "Sliding Window Maximum",
  "Design LRU Cache",
  "Implement Trie",
  "Word Search II",
  "Alien Dictionary",
  "Critical Connections",
  "Cheapest Flights Within K Stops",
  "Network Delay Time",
  "Pacific Atlantic Water Flow",
  "Surrounded Regions",
  "Clone Graph",
  "Binary Tree Max Path Sum",
  "Lowest Common Ancestor",
  "Diameter of Binary Tree",
  "Validate BST",
  "Kth Largest Element",
  "Top K Frequent Elements",
  "Find Median from Data Stream",
  "Merge Intervals",
  "Insert Interval",
  "Non-overlapping Intervals",
  "Meeting Rooms II",
  "Jump Game",
  "Gas Station",
  "Candy",
  "Frog Jump",
  "Partition Equal Subset Sum",
  "Target Sum",
  "Burst Balloons",
  "Russian Doll Envelopes",
  "Longest Common Subsequence",
  "Regular Expression Matching",
  "Wildcard Matching",
  "Minimum Window Substring",
  "Find All Anagrams",
  "Group Anagrams",
  "Valid Anagram",
  "First Missing Positive",
  "Sort Colors",
  "Product of Array Except Self",
  "Rotate Array",
  "Container With Most Water",
  "3Sum",
  "4Sum",
  "Trapping Rain Water II",
  "Largest Rectangle in Histogram",
  "Maximal Rectangle",
  "Binary Search on Answer",
  "Aggressive Cows",
  "Book Allocation",
  "Split Array Largest Sum",
  "Capacity To Ship Packages",
  "Koko Eating Bananas",
  "Search in Rotated Sorted Array",
  "Find Peak Element",
  "Median of Matrix",
  "Count Inversions",
  "Reverse Pairs",
  "Fenwick Range Sum",
  "Segment Tree Range Update",
  "Heavy Light Decomposition",
  "Centroid Decomposition",
  "Mo's Algorithm",
  "Sqrt Decomposition",
  "Digit DP Classic",
  "Bitmask DP TSP",
  "Knapsack Variants",
  "Matrix Chain Multiplication",
  "Palindrome DP",
  "Tree DP Rerooting",
  "Centroid Tree",
  "Interactive Guess",
  "Constructive Permutation",
  "Game Theory Nim",
  "Probability DP",
  "Number Theory CRT",
  "Modular Inverse",
  "Miller Rabin",
];

const platforms: Platform[] = [
  "LEETCODE",
  "CODEFORCES",
  "CODECHEF",
  "ATCODER",
  "GFG",
  "CSES",
  "HACKERRANK",
];

const diffs: Difficulty[] = ["EASY", "MEDIUM", "HARD", "EXPERT"];

function hash(i: number) {
  return ((i * 2654435761) >>> 0) % 1000;
}

export const problems = problemTitles.map((title, i) => {
  const h = hash(i);
  const difficulty = diffs[h % (i % 7 === 0 ? 4 : 3)];
  const platform = platforms[i % platforms.length];
  const tagCount = 1 + (h % 3);
  const tags = Array.from({ length: tagCount }, (_, j) => topics[(i + j * 3) % topics.length]);
  const companyCount = h % 4 === 0 ? 0 : 1 + (h % 3);
  const problemCompanies = Array.from(
    { length: companyCount },
    (_, j) => companies[(i + j * 2) % companies.length]
  );
  return {
    id: `p${i + 1}`,
    platform,
    externalId: `${platform.toLowerCase()}-${i + 1}`,
    title,
    url: "#",
    difficulty,
    rating:
      difficulty === "EASY"
        ? 800 + (h % 400)
        : difficulty === "MEDIUM"
          ? 1200 + (h % 500)
          : difficulty === "HARD"
            ? 1700 + (h % 500)
            : 2200 + (h % 600),
    acceptance: 20 + (h % 60) + (h % 10) / 10,
    tags,
    companies: problemCompanies,
    frequency: h % 100,
    isPremium: h % 11 === 0,
    solved: h % 5 === 0 || h % 7 === 0,
    bookmarked: h % 13 === 0,
  };
});

export const submissions = Array.from({ length: 80 }, (_, i) => {
  const problem = problems[i % problems.length];
  const verdicts: Verdict[] = ["AC", "AC", "AC", "WA", "WA", "TLE", "RE", "CE"];
  const langs = ["C++", "Python", "Java", "JavaScript", "Go", "Rust"];
  const v = verdicts[hash(i + 3) % verdicts.length];
  return {
    id: `s${i + 1}`,
    problemId: problem.id,
    problemTitle: problem.title,
    platform: problem.platform,
    verdict: v,
    language: langs[i % langs.length],
    runtimeMs: v === "AC" ? 10 + (hash(i) % 500) : null,
    memoryKb: v === "AC" ? 8000 + (hash(i) % 40000) : null,
    difficulty: problem.difficulty,
    tags: problem.tags,
    submittedAt: new Date(now - (i * 0.4 + (hash(i) % 5)) * day).toISOString(),
  };
});

export function generateHeatmap(days = 365) {
  const cells: { date: string; count: number; platforms: Record<string, number> }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * day);
    const date = d.toISOString().slice(0, 10);
    const seed = hash(i + d.getDate() * 7);
    // Higher activity on weekdays, streak-like denser recent activity
    const weekday = d.getDay();
    const recentBoost = i < 50 ? 2 : 0;
    const base = weekday === 0 || weekday === 6 ? 0 : 1;
    let count = 0;
    if (seed % 3 !== 0 || i < 47) {
      count = base + (seed % 5) + recentBoost;
      if (seed % 11 === 0) count = 0;
      if (i < 47 && seed % 7 !== 0) count = Math.max(1, count);
    }
    const platList = ["CODEFORCES", "LEETCODE", "ATCODER", "CODECHEF"];
    const platforms: Record<string, number> = {};
    let remaining = count;
    platList.forEach((p, idx) => {
      if (remaining <= 0) return;
      const c = idx === platList.length - 1 ? remaining : Math.min(remaining, seed % 3);
      if (c > 0) platforms[p] = c;
      remaining -= c;
    });
    cells.push({ date, count, platforms });
  }
  return cells;
}

export const ratingHistory = Array.from({ length: 40 }, (_, i) => {
  const base = 1200 + i * 12 + Math.sin(i / 3) * 40;
  return {
    contest: `Contest ${i + 1}`,
    date: new Date(now - (40 - i) * 7 * day).toISOString().slice(0, 10),
    rating: Math.round(base),
    rank: 500 + ((hash(i) * 7) % 3000),
    solved: 2 + (hash(i) % 4),
    platform: platforms[i % 4],
  };
});

export const topicMastery = topics.slice(0, 16).map((topic, i) => ({
  topic,
  solved: 10 + hash(i * 17) % 80,
  accuracy: 40 + hash(i * 13) % 50,
  strength: Math.min(100, 20 + hash(i * 19) % 80),
  weak: hash(i) % 5 === 0,
}));

export const goals = [
  {
    id: "g1",
    title: "Solve 5 problems / day",
    period: "DAILY",
    target: 5,
    current: 3,
    metric: "problems",
    isCompleted: false,
  },
  {
    id: "g2",
    title: "Participate in 3 contests",
    period: "WEEKLY",
    target: 3,
    current: 1,
    metric: "contests",
    isCompleted: false,
  },
  {
    id: "g3",
    title: "Reach 1800 CF rating",
    period: "MONTHLY",
    target: 1800,
    current: 1624,
    metric: "rating",
    isCompleted: false,
  },
  {
    id: "g4",
    title: "Maintain 50-day streak",
    period: "MONTHLY",
    target: 50,
    current: 47,
    metric: "streak",
    isCompleted: false,
  },
  {
    id: "g5",
    title: "Finish Graph roadmap",
    period: "MONTHLY",
    target: 40,
    current: 28,
    metric: "roadmap",
    isCompleted: false,
  },
];

export const achievements = [
  { key: "100_problems", name: "Century", description: "Solve 100 problems", icon: "💯", unlocked: true, xp: 100 },
  { key: "500_problems", name: "Half K", description: "Solve 500 problems", icon: "🔥", unlocked: true, xp: 500 },
  { key: "1000_problems", name: "Grand Solver", description: "Solve 1000 problems", icon: "👑", unlocked: true, xp: 1000 },
  { key: "7_streak", name: "Week Warrior", description: "7-day streak", icon: "⚡", unlocked: true, xp: 70 },
  { key: "30_streak", name: "Monthly Machine", description: "30-day streak", icon: "🚀", unlocked: true, xp: 300 },
  { key: "365_streak", name: "Year of Code", description: "365-day streak", icon: "🏆", unlocked: false, xp: 3650 },
  { key: "top10", name: "Top 10%", description: "Finish top 10% in a contest", icon: "🥇", unlocked: true, xp: 250 },
  { key: "knight", name: "Knight", description: "Reach LeetCode Knight", icon: "⚔️", unlocked: true, xp: 400 },
  { key: "expert", name: "Expert", description: "Reach CF Expert", icon: "💎", unlocked: false, xp: 600 },
  { key: "master", name: "Master", description: "Reach CF Master", icon: "🌟", unlocked: false, xp: 1200 },
  { key: "contest_winner", name: "Contest Winner", description: "Win a contest", icon: "🏅", unlocked: false, xp: 2000 },
  { key: "polyglot", name: "Polyglot", description: "Solve in 5 languages", icon: "🌐", unlocked: true, xp: 200 },
];

export const friends = [
  { id: "f1", username: "tourist_fan", name: "Priya Sharma", rating: 2104, streak: 120, solved: 2100, country: "India", college: "IIT Bombay", xp: 22000 },
  { id: "f2", username: "dp_wizard", name: "Rahul Mehta", rating: 1890, streak: 34, solved: 1400, country: "India", college: "BITS Pilani", xp: 15800 },
  { id: "f3", username: "graph_girl", name: "Sara Kim", rating: 1756, streak: 56, solved: 980, country: "Korea", college: "KAIST", xp: 13200 },
  { id: "f4", username: "binary_beast", name: "James Liu", rating: 1688, streak: 12, solved: 870, country: "USA", college: "MIT", xp: 11000 },
  { id: "f5", username: "seg_tree", name: "Ana Costa", rating: 1540, streak: 22, solved: 720, country: "Brazil", college: "USP", xp: 9800 },
  { id: "f6", username: "neethack", name: "Dev Patel", rating: 1920, streak: 88, solved: 1600, country: "India", college: "NIT Trichy", xp: 17000 },
];

export const leaderboard = [
  ...friends.map((f, i) => ({ ...f, rank: i + 1, weeklySolved: 20 + (i * 3) % 40 })),
  {
    id: demoUser.id,
    username: demoUser.username,
    name: demoUser.name,
    rating: 1624,
    streak: demoUser.streak,
    solved: 1960,
    country: demoUser.country,
    college: demoUser.college,
    xp: demoUser.xp,
    rank: 7,
    weeklySolved: 28,
  },
].sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));

export const roadmaps = [
  {
    slug: "arrays",
    title: "Arrays & Hashing",
    description: "Foundation of problem solving — arrays, hashing, two pointers",
    category: "Fundamentals",
    progress: 85,
    total: 40,
    completed: 34,
    color: "from-blue-500 to-cyan-400",
  },
  {
    slug: "strings",
    title: "Strings",
    description: "Pattern matching, KMP, Z-algorithm, string DP",
    category: "Fundamentals",
    progress: 60,
    total: 35,
    completed: 21,
    color: "from-violet-500 to-purple-400",
  },
  {
    slug: "linked-list",
    title: "Linked List",
    description: "Pointers, reversal, cycle detection, design problems",
    category: "Fundamentals",
    progress: 90,
    total: 25,
    completed: 22,
    color: "from-emerald-500 to-teal-400",
  },
  {
    slug: "stack-queue",
    title: "Stack & Queue",
    description: "Monotonic stacks, deque tricks, expression evaluation",
    category: "Fundamentals",
    progress: 70,
    total: 30,
    completed: 21,
    color: "from-amber-500 to-orange-400",
  },
  {
    slug: "trees",
    title: "Trees & BST",
    description: "Traversals, LCA, diameter, BST invariants, tree DP intro",
    category: "Intermediate",
    progress: 55,
    total: 45,
    completed: 25,
    color: "from-green-500 to-lime-400",
  },
  {
    slug: "graphs",
    title: "Graphs",
    description: "BFS/DFS, shortest paths, MSTs, SCCs, flows intro",
    category: "Intermediate",
    progress: 70,
    total: 50,
    completed: 35,
    color: "from-rose-500 to-pink-400",
  },
  {
    slug: "heap",
    title: "Heap & Priority Queue",
    description: "Top-K, streaming, Dijkstra companion patterns",
    category: "Intermediate",
    progress: 40,
    total: 20,
    completed: 8,
    color: "from-yellow-500 to-amber-400",
  },
  {
    slug: "trie",
    title: "Trie",
    description: "Prefix trees, XOR trie, autocomplete patterns",
    category: "Intermediate",
    progress: 30,
    total: 18,
    completed: 5,
    color: "from-indigo-500 to-blue-400",
  },
  {
    slug: "dp",
    title: "Dynamic Programming",
    description: "1D/2D DP, knapsack, LIS, digit DP, DP on trees/graphs",
    category: "Advanced",
    progress: 45,
    total: 60,
    completed: 27,
    color: "from-fuchsia-500 to-pink-400",
  },
  {
    slug: "greedy",
    title: "Greedy",
    description: "Exchange arguments, scheduling, constructive greedy",
    category: "Intermediate",
    progress: 50,
    total: 28,
    completed: 14,
    color: "from-sky-500 to-blue-400",
  },
  {
    slug: "bit",
    title: "Bit Manipulation",
    description: "Bitmasks, XOR tricks, SOS DP intro",
    category: "Intermediate",
    progress: 35,
    total: 22,
    completed: 8,
    color: "from-slate-500 to-zinc-400",
  },
  {
    slug: "segment-tree",
    title: "Segment Tree & Fenwick",
    description: "Range queries, lazy propagation, Fenwick trees",
    category: "Advanced",
    progress: 20,
    total: 30,
    completed: 6,
    color: "from-red-500 to-orange-400",
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    description: "On answer, rotated arrays, predicate search",
    category: "Fundamentals",
    progress: 75,
    total: 25,
    completed: 19,
    color: "from-cyan-500 to-teal-400",
  },
  {
    slug: "backtracking",
    title: "Backtracking",
    description: "Subsets, permutations, constraint satisfaction",
    category: "Intermediate",
    progress: 65,
    total: 20,
    completed: 13,
    color: "from-purple-500 to-violet-400",
  },
  {
    slug: "geometry",
    title: "Computational Geometry",
    description: "Convex hull, line sweep, half-planes",
    category: "Advanced",
    progress: 10,
    total: 18,
    completed: 2,
    color: "from-teal-500 to-emerald-400",
  },
  {
    slug: "math",
    title: "Math & Number Theory",
    description: "Primes, modular arithmetic, combinatorics, CRT",
    category: "Advanced",
    progress: 40,
    total: 35,
    completed: 14,
    color: "from-orange-500 to-red-400",
  },
];

export const practiceSheets = [
  { id: "blind75", name: "Blind 75", problems: 75, completed: 52, category: "Interview" },
  { id: "neetcode150", name: "NeetCode 150", problems: 150, completed: 88, category: "Interview" },
  { id: "striver", name: "Striver SDE Sheet", problems: 191, completed: 110, category: "Interview" },
  { id: "cp31", name: "CP-31 Sheet", problems: 310, completed: 95, category: "CP" },
  { id: "dp-roadmap", name: "DP Roadmap", problems: 60, completed: 27, category: "Topic" },
  { id: "graphs-roadmap", name: "Graphs Roadmap", problems: 50, completed: 35, category: "Topic" },
];

export const dailyPractice = problems
  .filter((p) => !p.solved)
  .slice(0, 5)
  .map((p, i) => ({
    ...p,
    reason:
      i === 0
        ? "Weak topic: Segment Tree"
        : i === 1
          ? "Based on recent WA patterns"
          : i === 2
            ? "Matches your CF rating band"
            : i === 3
              ? "Company prep: Google frequency"
              : "Balanced medium for streak",
  }));

export const discussions = [
  {
    id: "d1",
    title: "How to approach Digit DP from scratch?",
    author: "dp_wizard",
    tags: ["DP", "Tutorial"],
    likes: 128,
    comments: 34,
    createdAt: new Date(now - 2 * day).toISOString(),
  },
  {
    id: "d2",
    title: "Editorial intuition for CF 1000C",
    author: "graph_girl",
    tags: ["Codeforces", "Editorial"],
    likes: 86,
    comments: 19,
    createdAt: new Date(now - 1 * day).toISOString(),
  },
  {
    id: "d3",
    title: "My 6-month journey: 1200 → 1800",
    author: "neethack",
    tags: ["Motivation", "Roadmap"],
    likes: 340,
    comments: 72,
    createdAt: new Date(now - 4 * day).toISOString(),
  },
  {
    id: "d4",
    title: "Binary lifting vs LCA with Euler tour",
    author: "seg_tree",
    tags: ["Trees", "Techniques"],
    likes: 54,
    comments: 12,
    createdAt: new Date(now - 6 * hour).toISOString(),
  },
];

export const notes = [
  {
    id: "n1",
    title: "Segment Tree Lazy Template",
    content: "```cpp\n// push / pull lazy propagation\n```\nRemember: push before recurse, pull after.",
    tags: ["Segment Tree", "Template"],
    problemTitle: "Range Updates",
    updatedAt: new Date(now - day).toISOString(),
  },
  {
    id: "n2",
    title: "Binary Search on Answer checklist",
    content: "1. Monotonic predicate\n2. lo/hi bounds\n3. mid overflow-safe\n4. verify edge cases",
    tags: ["Binary Search"],
    problemTitle: "Koko Eating Bananas",
    updatedAt: new Date(now - 3 * day).toISOString(),
  },
  {
    id: "n3",
    title: "Graph multipource BFS",
    content: "Push all sources with dist 0. Works for rotting oranges, walls & gates.",
    tags: ["Graph", "BFS"],
    problemTitle: "01 Matrix",
    updatedAt: new Date(now - 5 * day).toISOString(),
  },
];

export const companySheets = companies.map((company, i) => ({
  company,
  total: 40 + hash(i) % 80,
  easy: 10 + hash(i * 2) % 20,
  medium: 20 + hash(i * 3) % 30,
  hard: 5 + hash(i * 5) % 20,
  solved: 5 + hash(i * 7) % 40,
  trending: hash(i) % 3 === 0,
}));

export function getDashboardStats() {
  const totalSolved = platformAccounts.reduce((s, p) => s + (p.platform === "GITHUB" ? 0 : p.solvedCount), 0);
  const easy = platformAccounts.reduce((s, p) => s + p.easySolved, 0);
  const medium = platformAccounts.reduce((s, p) => s + p.mediumSolved, 0);
  const hard = platformAccounts.reduce((s, p) => s + p.hardSolved, 0);
  const contestsAttended = platformAccounts.reduce((s, p) => s + p.contests, 0);
  return {
    totalSolved,
    easy,
    medium,
    hard,
    currentRating: 1624,
    peakRating: 1910,
    contestsAttended,
    averageRank: 1240,
    acceptance: 64.2,
    activeDays: 210,
    streak: demoUser.streak,
    maxStreak: demoUser.maxStreak,
    xp: demoUser.xp,
    level: demoUser.level,
    languages: [
      { name: "C++", value: 58 },
      { name: "Python", value: 24 },
      { name: "Java", value: 10 },
      { name: "JavaScript", value: 5 },
      { name: "Go", value: 3 },
    ],
  };
}
