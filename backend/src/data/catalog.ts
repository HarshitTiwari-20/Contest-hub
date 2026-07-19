import type { Difficulty, Platform } from "../generated/prisma/client.js";

export type CatalogProblem = {
  platform: Platform;
  externalId: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  rating?: number;
  tags: string[];
  companies: string[];
  frequency?: number;
};

export type RoadmapSeed = {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  nodes: {
    theory: { title: string; url: string; source: string }[];
    videos: { title: string; url: string }[];
    problems: { platform: Platform; externalId: string }[];
  };
};

export type PracticeSheetSeed = {
  id: string;
  name: string;
  category: string;
  description: string;
  problems: { platform: Platform; externalId: string }[];
};

/** Curated real problems across platforms with official URLs */
export const CATALOG_PROBLEMS: CatalogProblem[] = [
  // Codeforces classics
  {
    platform: "CODEFORCES",
    externalId: "4A",
    title: "Watermelon",
    url: "https://codeforces.com/problemset/problem/4/A",
    difficulty: "EASY",
    rating: 800,
    tags: ["math", "brute force"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "71A",
    title: "Way Too Long Words",
    url: "https://codeforces.com/problemset/problem/71/A",
    difficulty: "EASY",
    rating: 800,
    tags: ["strings"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "1A",
    title: "Theatre Square",
    url: "https://codeforces.com/problemset/problem/1/A",
    difficulty: "EASY",
    rating: 1000,
    tags: ["math"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "580C",
    title: "Kefa and Park",
    url: "https://codeforces.com/problemset/problem/580/C",
    difficulty: "MEDIUM",
    rating: 1500,
    tags: ["dfs and similar", "graphs", "trees"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "339D",
    title: "Xenia and Bit Operations",
    url: "https://codeforces.com/problemset/problem/339/D",
    difficulty: "HARD",
    rating: 1700,
    tags: ["data structures", "trees"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "550A",
    title: "Two Substrings",
    url: "https://codeforces.com/problemset/problem/550/A",
    difficulty: "MEDIUM",
    rating: 1400,
    tags: ["strings", "greedy"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "706B",
    title: "Interesting drink",
    url: "https://codeforces.com/problemset/problem/706/B",
    difficulty: "EASY",
    rating: 1100,
    tags: ["binary search", "implementation"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "977C",
    title: "Less or Equal",
    url: "https://codeforces.com/problemset/problem/977/C",
    difficulty: "EASY",
    rating: 1200,
    tags: ["binary search", "sortings"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "1365D",
    title: "Solve The Maze",
    url: "https://codeforces.com/problemset/problem/1365/D",
    difficulty: "MEDIUM",
    rating: 1700,
    tags: ["graphs", "dfs and similar", "implementation"],
    companies: [],
  },
  {
    platform: "CODEFORCES",
    externalId: "1203D2",
    title: "Remove the Substring (hard version)",
    url: "https://codeforces.com/problemset/problem/1203/D2",
    difficulty: "HARD",
    rating: 1800,
    tags: ["two pointers", "strings", "binary search"],
    companies: [],
  },

  // LeetCode
  {
    platform: "LEETCODE",
    externalId: "two-sum",
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "EASY",
    tags: ["Array", "Hash Table"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    frequency: 98,
  },
  {
    platform: "LEETCODE",
    externalId: "add-two-numbers",
    title: "Add Two Numbers",
    url: "https://leetcode.com/problems/add-two-numbers/",
    difficulty: "MEDIUM",
    tags: ["Linked List", "Math", "Recursion"],
    companies: ["Amazon", "Microsoft", "Meta", "Apple"],
    frequency: 85,
  },
  {
    platform: "LEETCODE",
    externalId: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "MEDIUM",
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    frequency: 92,
  },
  {
    platform: "LEETCODE",
    externalId: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    difficulty: "HARD",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    companies: ["Google", "Amazon", "Microsoft", "Apple"],
    frequency: 78,
  },
  {
    platform: "LEETCODE",
    externalId: "container-with-most-water",
    title: "Container With Most Water",
    url: "https://leetcode.com/problems/container-with-most-water/",
    difficulty: "MEDIUM",
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: ["Amazon", "Google", "Meta", "Adobe"],
    frequency: 80,
  },
  {
    platform: "LEETCODE",
    externalId: "3sum",
    title: "3Sum",
    url: "https://leetcode.com/problems/3sum/",
    difficulty: "MEDIUM",
    tags: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Meta", "Microsoft", "Adobe"],
    frequency: 88,
  },
  {
    platform: "LEETCODE",
    externalId: "valid-parentheses",
    title: "Valid Parentheses",
    url: "https://leetcode.com/problems/valid-parentheses/",
    difficulty: "EASY",
    tags: ["String", "Stack"],
    companies: ["Amazon", "Google", "Microsoft", "Bloomberg", "Meta"],
    frequency: 90,
  },
  {
    platform: "LEETCODE",
    externalId: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    url: "https://leetcode.com/problems/merge-two-sorted-lists/",
    difficulty: "EASY",
    tags: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple", "Adobe"],
    frequency: 82,
  },
  {
    platform: "LEETCODE",
    externalId: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    difficulty: "MEDIUM",
    tags: ["Tree", "BFS", "Binary Tree"],
    companies: ["Amazon", "Microsoft", "Meta", "Bloomberg"],
    frequency: 84,
  },
  {
    platform: "LEETCODE",
    externalId: "number-of-islands",
    title: "Number of Islands",
    url: "https://leetcode.com/problems/number-of-islands/",
    difficulty: "MEDIUM",
    tags: ["Array", "DFS", "BFS", "Union Find", "Matrix"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Uber"],
    frequency: 95,
  },
  {
    platform: "LEETCODE",
    externalId: "climbing-stairs",
    title: "Climbing Stairs",
    url: "https://leetcode.com/problems/climbing-stairs/",
    difficulty: "EASY",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    companies: ["Amazon", "Google", "Adobe", "Apple"],
    frequency: 75,
  },
  {
    platform: "LEETCODE",
    externalId: "coin-change",
    title: "Coin Change",
    url: "https://leetcode.com/problems/coin-change/",
    difficulty: "MEDIUM",
    tags: ["Array", "Dynamic Programming", "BFS"],
    companies: ["Amazon", "Google", "Microsoft", "Uber"],
    frequency: 86,
  },
  {
    platform: "LEETCODE",
    externalId: "word-break",
    title: "Word Break",
    url: "https://leetcode.com/problems/word-break/",
    difficulty: "MEDIUM",
    tags: ["Array", "Hash Table", "String", "Dynamic Programming", "Trie"],
    companies: ["Amazon", "Google", "Meta", "Bloomberg"],
    frequency: 83,
  },
  {
    platform: "LEETCODE",
    externalId: "lru-cache",
    title: "LRU Cache",
    url: "https://leetcode.com/problems/lru-cache/",
    difficulty: "MEDIUM",
    tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Uber"],
    frequency: 96,
  },
  {
    platform: "LEETCODE",
    externalId: "trapping-rain-water",
    title: "Trapping Rain Water",
    url: "https://leetcode.com/problems/trapping-rain-water/",
    difficulty: "HARD",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Meta", "Apple", "Bloomberg"],
    frequency: 91,
  },
  {
    platform: "LEETCODE",
    externalId: "serialize-and-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    difficulty: "HARD",
    tags: ["String", "Tree", "DFS", "BFS", "Design", "Binary Tree"],
    companies: ["Amazon", "Meta", "Microsoft", "LinkedIn"],
    frequency: 79,
  },
  {
    platform: "LEETCODE",
    externalId: "course-schedule",
    title: "Course Schedule",
    url: "https://leetcode.com/problems/course-schedule/",
    difficulty: "MEDIUM",
    tags: ["DFS", "BFS", "Graph", "Topological Sort"],
    companies: ["Amazon", "Google", "Microsoft", "TikTok"],
    frequency: 81,
  },
  {
    platform: "LEETCODE",
    externalId: "merge-intervals",
    title: "Merge Intervals",
    url: "https://leetcode.com/problems/merge-intervals/",
    difficulty: "MEDIUM",
    tags: ["Array", "Sorting"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Bloomberg"],
    frequency: 89,
  },
  {
    platform: "LEETCODE",
    externalId: "maximum-subarray",
    title: "Maximum Subarray",
    url: "https://leetcode.com/problems/maximum-subarray/",
    difficulty: "MEDIUM",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "LinkedIn", "Apple"],
    frequency: 87,
  },
  {
    platform: "LEETCODE",
    externalId: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    difficulty: "EASY",
    tags: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Microsoft", "Bloomberg", "Meta"],
    frequency: 94,
  },

  // CSES
  {
    platform: "CSES",
    externalId: "weird-algorithm",
    title: "Weird Algorithm",
    url: "https://cses.fi/problemset/task/1068",
    difficulty: "EASY",
    tags: ["Introductory", "Math"],
    companies: [],
  },
  {
    platform: "CSES",
    externalId: "missing-number",
    title: "Missing Number",
    url: "https://cses.fi/problemset/task/1083",
    difficulty: "EASY",
    tags: ["Introductory", "Math"],
    companies: [],
  },
  {
    platform: "CSES",
    externalId: "shortest-routes-i",
    title: "Shortest Routes I",
    url: "https://cses.fi/problemset/task/1671",
    difficulty: "MEDIUM",
    tags: ["Graph", "Shortest Paths", "Dijkstra"],
    companies: [],
  },
  {
    platform: "CSES",
    externalId: "dynamic-range-sum-queries",
    title: "Dynamic Range Sum Queries",
    url: "https://cses.fi/problemset/task/1648",
    difficulty: "MEDIUM",
    tags: ["Segment Tree", "Data Structures"],
    companies: [],
  },
  {
    platform: "CSES",
    externalId: "edit-distance",
    title: "Edit Distance",
    url: "https://cses.fi/problemset/task/1639",
    difficulty: "MEDIUM",
    tags: ["Dynamic Programming", "String"],
    companies: ["Google", "Amazon"],
  },

  // GFG
  {
    platform: "GFG",
    externalId: "detect-cycle-in-an-undirected-graph",
    title: "Detect cycle in an undirected graph",
    url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
    difficulty: "MEDIUM",
    tags: ["Graph", "DFS", "BFS"],
    companies: ["Amazon", "Microsoft", "Samsung"],
    frequency: 70,
  },
  {
    platform: "GFG",
    externalId: "subset-sum-problem",
    title: "Subset Sum Problem",
    url: "https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1",
    difficulty: "MEDIUM",
    tags: ["Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "Paytm"],
    frequency: 65,
  },
  {
    platform: "GFG",
    externalId: "binary-search",
    title: "Binary Search",
    url: "https://www.geeksforgeeks.org/problems/binary-search-1587115620/1",
    difficulty: "EASY",
    tags: ["Binary Search", "Searching"],
    companies: ["Amazon", "Microsoft", "Infosys", "TCS"],
    frequency: 72,
  },
];

export const ROADMAP_SEEDS: RoadmapSeed[] = [
  {
    slug: "arrays-hashing",
    title: "Arrays & Hashing",
    description: "Core array patterns, hash maps, and frequency counting.",
    category: "Fundamentals",
    order: 1,
    nodes: {
      theory: [
        {
          title: "Arrays Data Structure",
          url: "https://www.geeksforgeeks.org/array-data-structure/",
          source: "GFG",
        },
        {
          title: "Hashing Data Structure",
          url: "https://www.geeksforgeeks.org/hashing-data-structure/",
          source: "GFG",
        },
        {
          title: "Hash Table — Wikipedia overview",
          url: "https://en.wikipedia.org/wiki/Hash_table",
          source: "Web",
        },
      ],
      videos: [
        {
          title: "Arrays & Hashing — NeetCode",
          url: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
        },
        {
          title: "Hashing explained",
          url: "https://www.youtube.com/watch?v=KyUTuwz_b7Q",
        },
      ],
      problems: [
        { platform: "LEETCODE", externalId: "two-sum" },
        { platform: "LEETCODE", externalId: "valid-parentheses" },
        { platform: "LEETCODE", externalId: "best-time-to-buy-and-sell-stock" },
        { platform: "LEETCODE", externalId: "maximum-subarray" },
        { platform: "CODEFORCES", externalId: "4A" },
        { platform: "CSES", externalId: "missing-number" },
      ],
    },
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    description: "Pair sums, containers, and sliding window foundations.",
    category: "Fundamentals",
    order: 2,
    nodes: {
      theory: [
        {
          title: "Two Pointers Technique",
          url: "https://www.geeksforgeeks.org/two-pointers-technique/",
          source: "GFG",
        },
        {
          title: "Sliding Window",
          url: "https://www.geeksforgeeks.org/window-sliding-technique/",
          source: "GFG",
        },
      ],
      videos: [
        {
          title: "Two Pointers — NeetCode",
          url: "https://www.youtube.com/watch?v=cQ1Oz4ckceM",
        },
      ],
      problems: [
        { platform: "LEETCODE", externalId: "container-with-most-water" },
        { platform: "LEETCODE", externalId: "3sum" },
        { platform: "LEETCODE", externalId: "trapping-rain-water" },
        { platform: "LEETCODE", externalId: "longest-substring-without-repeating-characters" },
        { platform: "CODEFORCES", externalId: "1203D2" },
      ],
    },
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    description: "Classic search on arrays and answer space.",
    category: "Fundamentals",
    order: 3,
    nodes: {
      theory: [
        {
          title: "Binary Search",
          url: "https://www.geeksforgeeks.org/binary-search/",
          source: "GFG",
        },
        {
          title: "Binary Search — CP Algorithms",
          url: "https://cp-algorithms.com/num_methods/binary_search.html",
          source: "CP-Algorithms",
        },
      ],
      videos: [
        {
          title: "Binary Search — freeCodeCamp",
          url: "https://www.youtube.com/watch?v=MFhxShGxHWc",
        },
      ],
      problems: [
        { platform: "GFG", externalId: "binary-search" },
        { platform: "CODEFORCES", externalId: "706B" },
        { platform: "CODEFORCES", externalId: "977C" },
        { platform: "LEETCODE", externalId: "median-of-two-sorted-arrays" },
      ],
    },
  },
  {
    slug: "graphs",
    title: "Graphs",
    description: "BFS, DFS, islands, cycles, and shortest paths.",
    category: "Intermediate",
    order: 4,
    nodes: {
      theory: [
        {
          title: "Graph Data Structure",
          url: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
          source: "GFG",
        },
        {
          title: "BFS",
          url: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/",
          source: "GFG",
        },
        {
          title: "DFS",
          url: "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/",
          source: "GFG",
        },
      ],
      videos: [
        {
          title: "Graph Algorithms — William Fiset",
          url: "https://www.youtube.com/watch?v=09_LlHjoEiY",
        },
        {
          title: "Number of Islands explanation",
          url: "https://www.youtube.com/watch?v=pV2kpPD66nE",
        },
      ],
      problems: [
        { platform: "LEETCODE", externalId: "number-of-islands" },
        { platform: "LEETCODE", externalId: "course-schedule" },
        { platform: "CODEFORCES", externalId: "580C" },
        { platform: "CODEFORCES", externalId: "1365D" },
        { platform: "CSES", externalId: "shortest-routes-i" },
        { platform: "GFG", externalId: "detect-cycle-in-an-undirected-graph" },
      ],
    },
  },
  {
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    description: "1D/2D DP classics for interviews and contests.",
    category: "Intermediate",
    order: 5,
    nodes: {
      theory: [
        {
          title: "Dynamic Programming",
          url: "https://www.geeksforgeeks.org/dynamic-programming/",
          source: "GFG",
        },
        {
          title: "0/1 Knapsack",
          url: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/",
          source: "GFG",
        },
        {
          title: "DP — AtCoder Educational DP Contest intro",
          url: "https://atcoder.jp/contests/dp/tasks",
          source: "AtCoder",
        },
      ],
      videos: [
        {
          title: "DP playlist intro — Aditya Verma style patterns",
          url: "https://www.youtube.com/watch?v=nqowUJzG-iM",
        },
        {
          title: "Climbing Stairs DP",
          url: "https://www.youtube.com/watch?v=Y0lT9Fck7qI",
        },
      ],
      problems: [
        { platform: "LEETCODE", externalId: "climbing-stairs" },
        { platform: "LEETCODE", externalId: "coin-change" },
        { platform: "LEETCODE", externalId: "word-break" },
        { platform: "LEETCODE", externalId: "maximum-subarray" },
        { platform: "CSES", externalId: "edit-distance" },
        { platform: "GFG", externalId: "subset-sum-problem" },
      ],
    },
  },
  {
    slug: "segment-trees",
    title: "Segment Trees",
    description: "Range queries and updates for contest problems.",
    category: "Advanced",
    order: 6,
    nodes: {
      theory: [
        {
          title: "Segment Tree",
          url: "https://www.geeksforgeeks.org/segment-tree-data-structure/",
          source: "GFG",
        },
        {
          title: "Segment Tree — CP Algorithms",
          url: "https://cp-algorithms.com/data_structures/segment_tree.html",
          source: "CP-Algorithms",
        },
      ],
      videos: [
        {
          title: "Segment Tree full course",
          url: "https://www.youtube.com/watch?v=2bSS8rtFym4",
        },
      ],
      problems: [
        { platform: "CODEFORCES", externalId: "339D" },
        { platform: "CSES", externalId: "dynamic-range-sum-queries" },
      ],
    },
  },
];

export const PRACTICE_SHEETS: PracticeSheetSeed[] = [
  {
    id: "sheet-blind75",
    name: "Blind 75 core",
    category: "Interview",
    description: "Highest-signal interview problems",
    problems: [
      { platform: "LEETCODE", externalId: "two-sum" },
      { platform: "LEETCODE", externalId: "best-time-to-buy-and-sell-stock" },
      { platform: "LEETCODE", externalId: "valid-parentheses" },
      { platform: "LEETCODE", externalId: "maximum-subarray" },
      { platform: "LEETCODE", externalId: "3sum" },
      { platform: "LEETCODE", externalId: "container-with-most-water" },
      { platform: "LEETCODE", externalId: "number-of-islands" },
      { platform: "LEETCODE", externalId: "course-schedule" },
      { platform: "LEETCODE", externalId: "coin-change" },
      { platform: "LEETCODE", externalId: "lru-cache" },
      { platform: "LEETCODE", externalId: "trapping-rain-water" },
      { platform: "LEETCODE", externalId: "merge-intervals" },
    ],
  },
  {
    id: "sheet-cf-beginner",
    name: "CF beginner ladder",
    category: "Contest",
    description: "800–1400 Codeforces starters",
    problems: [
      { platform: "CODEFORCES", externalId: "4A" },
      { platform: "CODEFORCES", externalId: "71A" },
      { platform: "CODEFORCES", externalId: "1A" },
      { platform: "CODEFORCES", externalId: "706B" },
      { platform: "CODEFORCES", externalId: "977C" },
      { platform: "CODEFORCES", externalId: "550A" },
    ],
  },
  {
    id: "sheet-graphs",
    name: "Graph essentials",
    category: "Topic",
    description: "DFS/BFS/topo across platforms",
    problems: [
      { platform: "LEETCODE", externalId: "number-of-islands" },
      { platform: "LEETCODE", externalId: "course-schedule" },
      { platform: "CODEFORCES", externalId: "580C" },
      { platform: "CODEFORCES", externalId: "1365D" },
      { platform: "CSES", externalId: "shortest-routes-i" },
      { platform: "GFG", externalId: "detect-cycle-in-an-undirected-graph" },
    ],
  },
  {
    id: "sheet-dp",
    name: "DP essentials",
    category: "Topic",
    description: "Interview + contest DP",
    problems: [
      { platform: "LEETCODE", externalId: "climbing-stairs" },
      { platform: "LEETCODE", externalId: "coin-change" },
      { platform: "LEETCODE", externalId: "word-break" },
      { platform: "CSES", externalId: "edit-distance" },
      { platform: "GFG", externalId: "subset-sum-problem" },
    ],
  },
];

export const GOAL_TEMPLATES = [
  {
    key: "daily-3",
    title: "Solve 3 problems daily",
    description: "Build consistency with a small daily target",
    period: "DAILY" as const,
    target: 3,
    metric: "problems",
  },
  {
    key: "daily-5",
    title: "Solve 5 problems daily",
    description: "Aggressive daily volume",
    period: "DAILY" as const,
    target: 5,
    metric: "problems",
  },
  {
    key: "weekly-20",
    title: "20 problems this week",
    description: "Steady weekly progress",
    period: "WEEKLY" as const,
    target: 20,
    metric: "problems",
  },
  {
    key: "weekly-contest-2",
    title: "2 contests this week",
    description: "Contest practice cadence",
    period: "WEEKLY" as const,
    target: 2,
    metric: "contests",
  },
  {
    key: "monthly-100",
    title: "100 problems this month",
    description: "Longer-horizon grind",
    period: "MONTHLY" as const,
    target: 100,
    metric: "problems",
  },
  {
    key: "streak-7",
    title: "7-day streak",
    description: "Don't break the chain",
    period: "WEEKLY" as const,
    target: 7,
    metric: "streak_days",
  },
];
