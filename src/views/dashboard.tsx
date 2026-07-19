"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { StatCards, type DashboardStats } from "@/components/charts/stat-cards";
import { CodingHeatmap } from "@/components/charts/heatmap";
import { RatingChart } from "@/components/charts/rating-chart";
import { ConnectPlatformsBanner } from "@/components/connect-platforms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api-client";
import {
  formatNumber,
  platformLabel,
  relativeTime,
  timeUntil,
  verdictColor,
  cn,
} from "@/lib/utils";

type DashboardData = {
  connected: boolean;
  stats: DashboardStats | null;
  heatmap: { date: string; count: number }[];
  ratingHistory: { date: string; rating: number }[];
  upcomingContests: {
    id: string;
    name: string;
    platform: string;
    status: string;
    startTime: string;
    durationMin: number;
    url?: string;
  }[];
  recentSubmissions: {
    id: string;
    verdict: string;
    language: string;
    platform: string;
    submittedAt: string;
    problemTitle: string;
    problemUrl: string | null;
  }[];
  goals: {
    id: string;
    title: string;
    current: number;
    target: number;
    metric: string;
  }[];
  accounts: {
    platform: string;
    handle: string;
    rating: number | null;
    solvedCount: number;
    rank: string | null;
  }[];
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const firstName =
    session?.user?.name?.split(/\s+/)[0] ||
    session?.user?.username ||
    "there";

  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    apiFetch<DashboardData>("/api/dashboard", { userId })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-sm text-destructive">{error}</div>
    );
  }

  if (!data?.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect a platform to load your real competitive programming stats.
          </p>
        </div>
        <ConnectPlatformsBanner />
        {data?.upcomingContests && data.upcomingContests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming contests</CardTitle>
              <CardDescription>From Codeforces (live)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.upcomingContests.slice(0, 4).map((c) => (
                <a
                  key={c.id}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeUntil(c.startTime)}
                  </span>
                </a>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const stats = data.stats!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live data from your connected platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/contests">
              <Calendar className="h-4 w-4" /> Contests
            </Link>
          </Button>
          <Button asChild>
            <Link href="/practice">
              <Sparkles className="h-4 w-4" /> Practice
            </Link>
          </Button>
        </div>
      </div>

      <StatCards stats={stats} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Activity heatmap</CardTitle>
            <CardDescription>From synced platform submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <CodingHeatmap data={data.heatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>Your active targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.goals.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No goals yet.{" "}
                <Link href="/goals" className="underline">
                  Create one
                </Link>
              </p>
            )}
            {data.goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {g.current}/{g.target}
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/goals">Manage goals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Rating progression</CardTitle>
              <CardDescription>Contest rating history</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/analytics">
                Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RatingChart data={data.ratingHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Upcoming contests</CardTitle>
              <CardDescription>Live from Codeforces</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/contests">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingContests.slice(0, 5).map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 rounded-xl border border-border/50 p-3 transition hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {c.platform.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    {c.status === "LIVE" && <Badge>LIVE</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{platformLabel(c.platform)}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {c.status === "LIVE" ? "Live now" : timeUntil(c.startTime)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connected platforms</CardTitle>
            <CardDescription>Synced ratings & solved counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.accounts.map((a) => (
              <div
                key={a.platform}
                className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{platformLabel(a.platform)}</p>
                  <p className="text-xs text-muted-foreground">@{a.handle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{a.rating ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(a.solvedCount)} solved
                    {a.rank ? ` · ${a.rank}` : ""}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/settings">
                Manage accounts <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
            <CardDescription>Latest activity from sync</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentSubmissions.length === 0 && (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              )}
              {data.recentSubmissions.map((s) => (
                <a
                  key={s.id}
                  href={s.problemUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold",
                      verdictColor(s.verdict)
                    )}
                  >
                    {s.verdict}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.problemTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {platformLabel(s.platform)} · {s.language}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(s.submittedAt)}
                  </span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
