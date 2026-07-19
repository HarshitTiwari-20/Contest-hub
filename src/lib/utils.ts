import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function platformLabel(platform: string): string {
  const map: Record<string, string> = {
    LEETCODE: "LeetCode",
    CODEFORCES: "Codeforces",
    CODECHEF: "CodeChef",
    ATCODER: "AtCoder",
    GFG: "GeeksforGeeks",
    HACKERRANK: "HackerRank",
    HACKEREARTH: "HackerEarth",
    CODING_NINJAS: "Coding Ninjas",
    CSES: "CSES",
    TOPCODER: "TopCoder",
    KICKSTART: "Kick Start",
    META_HC: "Meta Hacker Cup",
    ICPC: "ICPC",
    AOC: "Advent of Code",
    GITHUB: "GitHub",
  };
  return map[platform] ?? platform;
}

export function platformColor(platform: string): string {
  const map: Record<string, string> = {
    LEETCODE: "#FFA116",
    CODEFORCES: "#1F8ACB",
    CODECHEF: "#5B4638",
    ATCODER: "#000000",
    GFG: "#2F8D46",
    HACKERRANK: "#00EA64",
    HACKEREARTH: "#2C3454",
    CSES: "#4B5563",
    TOPCODER: "#29A8E0",
    GITHUB: "#8B5CF6",
  };
  return map[platform] ?? "#6366F1";
}

export function difficultyColor(d: string): string {
  switch (d) {
    case "EASY":
      return "text-emerald-500";
    case "MEDIUM":
      return "text-amber-500";
    case "HARD":
      return "text-rose-500";
    case "EXPERT":
      return "text-purple-500";
    default:
      return "text-muted-foreground";
  }
}

export function verdictColor(v: string): string {
  switch (v) {
    case "AC":
      return "text-emerald-500 bg-emerald-500/10";
    case "WA":
      return "text-rose-500 bg-rose-500/10";
    case "TLE":
      return "text-amber-500 bg-amber-500/10";
    case "MLE":
      return "text-orange-500 bg-orange-500/10";
    case "RE":
      return "text-red-500 bg-red-500/10";
    case "CE":
      return "text-slate-500 bg-slate-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Started";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
