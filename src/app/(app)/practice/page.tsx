"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api-client";
import { cn, difficultyColor, platformLabel } from "@/lib/utils";

type ProblemItem = {
  id: string;
  title: string;
  url: string | null;
  platform: string;
  difficulty: string;
  tags: string[];
  solved: boolean;
  reason?: string;
};

type Sheet = {
  id: string;
  name: string;
  category: string;
  description: string;
  problems: ProblemItem[];
  completed: number;
  total: number;
};

export default function PracticePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [sheets, setSheets] = React.useState<Sheet[]>([]);
  const [daily, setDaily] = React.useState<ProblemItem[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) return;
    apiFetch<{ sheets: Sheet[]; daily: ProblemItem[] }>("/api/practice", {
      userId,
    })
      .then((d) => {
        setSheets(d.sheets);
        setDaily(d.daily);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading practice…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Curated sheets and recommendations — open any problem on its platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Recommended today</CardTitle>
          </div>
          <CardDescription>Unsolved problems from the catalog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {daily.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recommendations — try connecting platforms or browsing all problems.
            </p>
          )}
          {daily.map((p, i) => (
            <ProblemRow key={p.id} problem={p} index={i + 1} />
          ))}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Curated sheets</h2>
        <div className="space-y-3">
          {sheets.map((s) => {
            const pct = s.total
              ? Math.round((s.completed / s.total) * 100)
              : 0;
            const open = expanded === s.id;
            return (
              <Card key={s.id}>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setExpanded(open ? null : s.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {open ? (
                          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="text-base">{s.name}</CardTitle>
                          <CardDescription>{s.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{s.category}</Badge>
                    </div>
                    <div className="mt-3 pl-6">
                      <Progress value={pct} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.completed}/{s.total} solved · {pct}%
                      </p>
                    </div>
                  </CardHeader>
                </button>
                {open && (
                  <CardContent className="space-y-2 border-t pt-4">
                    {s.problems.map((p, i) => (
                      <ProblemRow key={p.id} problem={p} index={i + 1} />
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/roadmaps">
            Browse learning roadmaps <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ProblemRow({
  problem: p,
  index,
}: {
  problem: ProblemItem;
  index: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card p-3 sm:flex-row sm:items-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
        {p.solved ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          index
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{p.title}</p>
          <span className={cn("text-xs font-semibold", difficultyColor(p.difficulty))}>
            {p.difficulty}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {platformLabel(p.platform)}
          </Badge>
        </div>
        {p.reason && (
          <p className="mt-0.5 text-xs text-muted-foreground">{p.reason}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-1">
          {p.tags.slice(0, 4).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      </div>
      {p.url && (
        <Button size="sm" variant="outline" asChild>
          <a href={p.url} target="_blank" rel="noreferrer">
            Solve <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}
