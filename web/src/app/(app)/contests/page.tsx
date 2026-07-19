"use client";

import * as React from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { platformLabel, timeUntil } from "@/lib/utils";

type Contest = {
  id: string;
  platform: string;
  name: string;
  url?: string;
  startTime: string;
  durationMin: number;
  status: string;
};

const PLATFORMS = [
  "ALL",
  "CODEFORCES",
  "LEETCODE",
  "CODECHEF",
  "ATCODER",
  "HACKERRANK",
  "HACKEREARTH",
  "GFG",
  "TOPCODER",
] as const;

export default function ContestsPage() {
  const [contests, setContests] = React.useState<Contest[]>([]);
  const [search, setSearch] = React.useState("");
  const [platform, setPlatform] = React.useState("ALL");
  const [status, setStatus] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (platform !== "ALL") params.set("platform", platform);
    if (status !== "ALL") params.set("status", status);

    const t = setTimeout(() => {
      apiFetch<{ contests: Contest[] }>(`/api/contests?${params}`)
        .then((d) => setContests(d.contests))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [search, platform, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upcoming contests across Codeforces, LeetCode, CodeChef, AtCoder, and more
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          className="max-w-sm"
          placeholder="Search contests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p === "ALL" ? "All platforms" : platformLabel(p)}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All status</option>
          <option value="LIVE">Live</option>
          <option value="UPCOMING">Upcoming</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading contests…
        </div>
      ) : error ? (
        <p className="py-12 text-center text-sm text-destructive">{error}</p>
      ) : (
        <div className="space-y-2">
          {contests.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{c.name}</p>
                    {c.status === "LIVE" && <Badge>LIVE</Badge>}
                    <Badge variant="secondary" className="text-[10px]">
                      {platformLabel(c.platform)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.status === "LIVE"
                      ? "Live now"
                      : `Starts in ${timeUntil(c.startTime)}`}{" "}
                    · {c.durationMin}m ·{" "}
                    {new Date(c.startTime).toLocaleString()}
                  </p>
                </div>
                {c.url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={c.url} target="_blank" rel="noreferrer">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {contests.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No contests found for these filters.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
