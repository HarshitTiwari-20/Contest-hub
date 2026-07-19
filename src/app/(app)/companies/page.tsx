"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api-client";
import { cn, difficultyColor, platformLabel } from "@/lib/utils";

type CompanyProblem = {
  id: string;
  title: string;
  url: string | null;
  platform: string;
  difficulty: string;
  tags: string[];
  frequency: number | null;
  companies: string[];
  solved: boolean;
};

type Company = {
  company: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  solved: number;
  trending: boolean;
  problems: CompanyProblem[];
};

export default function CompaniesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<{ companies: Company[] }>("/api/companies", { userId })
      .then((d) => setCompanies(d.companies))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading companies…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Company interview prep
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interview-tagged problems from LeetCode / GFG / catalog — expand for full details
        </p>
      </div>

      <div className="space-y-3">
        {companies.map((c) => {
          const pct = c.total ? Math.round((c.solved / c.total) * 100) : 0;
          const open = expanded === c.company;
          return (
            <Card key={c.company}>
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpanded(open ? null : c.company)}
              >
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {open ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {c.company}
                  </CardTitle>
                  {c.trending && (
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" /> High frequency
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-3 text-xs text-muted-foreground">
                    <span className="text-emerald-500">{c.easy}E</span>
                    <span className="text-amber-500">{c.medium}M</span>
                    <span className="text-rose-500">{c.hard}H</span>
                    <span className="ml-auto">{c.total} total</span>
                  </div>
                  <Progress value={pct} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {c.solved} solved · {pct}%
                  </p>
                </CardContent>
              </button>

              {open && (
                <CardContent className="space-y-2 border-t pt-4">
                  {c.problems.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-start gap-3 rounded-lg border border-border px-3 py-3"
                    >
                      {p.solved ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="mt-0.5 h-4 w-4 rounded-full border border-border" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{p.title}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">
                            {platformLabel(p.platform)}
                          </Badge>
                          <span className={cn("font-semibold", difficultyColor(p.difficulty))}>
                            {p.difficulty}
                          </span>
                          {p.frequency != null && (
                            <span>Frequency {p.frequency}</span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {p.tags.map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Also tagged: {p.companies.join(", ")}
                        </p>
                      </div>
                      {p.url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={p.url} target="_blank" rel="noreferrer">
                            Open <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
        {companies.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No company-tagged problems in the database yet. Run the API seed.
          </p>
        )}
      </div>
    </div>
  );
}
