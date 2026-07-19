"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodingHeatmap } from "@/components/charts/heatmap";
import { RatingChart } from "@/components/charts/rating-chart";
import { StatCards, type DashboardStats } from "@/components/charts/stat-cards";
import { ConnectPlatformsBanner } from "@/components/connect-platforms";
import { apiFetch } from "@/lib/api-client";
import { platformLabel, verdictColor, cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsData = {
  connected: boolean;
  stats?: DashboardStats;
  ratingHistory?: { date: string; rating: number }[];
  heatmap?: { date: string; count: number }[];
  topicMastery?: { topic: string; strength: number; solved: number; total: number; weak: boolean }[];
  verdictCounts?: Record<string, number>;
  langCounts?: Record<string, number>;
  platformAccounts?: {
    platform: string;
    solvedCount: number;
    rating: number | null;
  }[];
  recentSubmissions?: {
    id: string;
    verdict: string;
    language: string;
    platform: string;
    submittedAt: string;
    problemTitle: string;
    problemUrl: string | null;
  }[];
  message?: string;
};

const COLORS = ["#22C55E", "#EF4444", "#F59E0B", "#8B5CF6", "#64748B", "#06B6D4"];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) return;
    apiFetch<AnalyticsData>("/api/analytics", { userId })
      .then(setData)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading analytics…
      </div>
    );
  }

  if (!data?.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect platforms to analyze real submissions and ratings.
          </p>
        </div>
        <ConnectPlatformsBanner />
      </div>
    );
  }

  const verdictData = Object.entries(data.verdictCounts ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const langData = Object.entries(data.langCounts ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const platformData = (data.platformAccounts ?? []).map((a) => ({
    name: platformLabel(a.platform),
    solved: a.solvedCount,
    rating: a.rating ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live ratings, submissions, platforms, and topic mastery
        </p>
      </div>

      {data.stats && <StatCards stats={data.stats} />}

      <Card>
        <CardHeader>
          <CardTitle>Activity heatmap</CardTitle>
          <CardDescription>Daily activity from connected platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <CodingHeatmap data={data.heatmap} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating progression</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingChart data={data.ratingHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform solved counts</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Bar dataKey="solved" fill="hsl(250, 90%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verdict distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {verdictData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions synced yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={verdictData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                    {verdictData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {langData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No language data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={langData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06B6D4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {(data.topicMastery?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topic mastery</CardTitle>
            <CardDescription>Based on your accepted submissions&apos; tags</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.topicMastery!.map((t) => (
              <div
                key={t.topic}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  t.weak ? "border-amber-500/30 bg-amber-500/5" : "border-border"
                )}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{t.topic}</span>
                  <span className="text-muted-foreground">{t.strength}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.solved}/{t.total} AC
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(data.recentSubmissions?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentSubmissions!.slice(0, 20).map((s) => (
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
                <span className="min-w-0 flex-1 truncate font-medium">{s.problemTitle}</span>
                <span className="text-xs text-muted-foreground">
                  {platformLabel(s.platform)}
                </span>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
