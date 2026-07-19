"use client";

import {
  CheckCircle2,
  Flame,
  Trophy,
  TrendingUp,
  Target,
  Percent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export type DashboardStats = {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  currentRating: number;
  peakRating: number;
  contestsAttended: number;
  averageRank?: number;
  streak: number;
  maxStreak: number;
  acceptance: number;
  activeDays?: number;
  xp: number;
  level: number;
};

export function StatCards({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      label: "Total Solved",
      value: formatNumber(stats.totalSolved),
      sub: `${stats.easy}E · ${stats.medium}M · ${stats.hard}H`,
      icon: CheckCircle2,
      color: "from-emerald-500/20 to-teal-500/5 text-emerald-500",
    },
    {
      label: "Current Rating",
      value: formatNumber(stats.currentRating),
      sub: `Peak ${formatNumber(stats.peakRating)}`,
      icon: TrendingUp,
      color: "from-violet-500/20 to-fuchsia-500/5 text-violet-500",
    },
    {
      label: "Contests",
      value: formatNumber(stats.contestsAttended),
      sub: "Synced platforms",
      icon: Trophy,
      color: "from-amber-500/20 to-orange-500/5 text-amber-500",
    },
    {
      label: "Streak",
      value: `${stats.streak}d`,
      sub: `Best ${stats.maxStreak}d`,
      icon: Flame,
      color: "from-orange-500/20 to-rose-500/5 text-orange-500",
    },
    {
      label: "Acceptance",
      value: stats.acceptance ? `${stats.acceptance}%` : "—",
      sub: "Where available",
      icon: Percent,
      color: "from-sky-500/20 to-blue-500/5 text-sky-500",
    },
    {
      label: "Level",
      value: `${stats.level}`,
      sub: `${formatNumber(stats.xp)} XP`,
      icon: Target,
      color: "from-pink-500/20 to-rose-500/5 text-pink-500",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="overflow-hidden border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{item.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.sub}</p>
              </div>
              <div className={`rounded-lg bg-gradient-to-br p-2 ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
