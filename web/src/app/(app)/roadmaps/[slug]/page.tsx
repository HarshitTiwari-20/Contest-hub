"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api-client";
import { cn, difficultyColor, platformLabel } from "@/lib/utils";

type RoadmapDetail = {
  roadmap: {
    slug: string;
    title: string;
    description: string;
    category: string;
    completed: number;
    total: number;
    progress: number;
  };
  theory: { title: string; url: string; source: string }[];
  videos: { title: string; url: string }[];
  problems: {
    id: string;
    title: string;
    url: string | null;
    platform: string;
    difficulty: string;
    tags: string[];
    solved: boolean;
  }[];
};

export default function RoadmapDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [data, setData] = React.useState<RoadmapDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) return;
    apiFetch<RoadmapDetail>(`/api/roadmaps/${slug}`, { userId })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium">{error || "Roadmap not found"}</p>
        <Button className="mt-4" asChild>
          <Link href="/roadmaps">Back</Link>
        </Button>
      </div>
    );
  }

  const { roadmap, theory, videos, problems } = data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/roadmaps">
          <ArrowLeft className="h-4 w-4" /> All roadmaps
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6">
          <Badge variant="secondary">{roadmap.category}</Badge>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {roadmap.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {roadmap.description}
          </p>
          <div className="mt-4 max-w-md">
            <Progress value={roadmap.progress} />
            <p className="mt-1 text-xs text-muted-foreground">
              {roadmap.completed}/{roadmap.total} solved from your connected accounts
              · {roadmap.progress}%
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" /> Theory & notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {theory.map((t) => (
              <a
                key={t.url}
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40"
              >
                <span>
                  {t.title}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t.source}
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PlayCircle className="h-4 w-4" /> Videos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {videos.map((v) => (
              <a
                key={v.url}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40"
              >
                <span>{v.title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Practice questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {problems.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 px-3 py-2.5"
            >
              {p.solved ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-border" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {platformLabel(p.platform)}
                  {p.tags.length ? ` · ${p.tags.slice(0, 2).join(", ")}` : ""}
                </p>
              </div>
              <span className={cn("text-xs font-semibold", difficultyColor(p.difficulty))}>
                {p.difficulty}
              </span>
              {p.url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={p.url} target="_blank" rel="noreferrer">
                    Solve <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
