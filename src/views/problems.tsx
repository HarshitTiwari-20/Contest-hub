"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, ExternalLink, Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { cn, difficultyColor, platformLabel } from "@/lib/utils";

type Problem = {
  id: string;
  title: string;
  url: string | null;
  platform: string;
  externalId: string;
  difficulty: string;
  tags: string[];
  companies: string[];
  rating: number | null;
  frequency: number | null;
  solved: boolean;
};

export default function ProblemsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">Loading problems…</div>
      }
    >
      <ProblemsContent />
    </Suspense>
  );
}

function ProblemsContent() {
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [search, setSearch] = React.useState(urlQ);
  const [difficulty, setDifficulty] = React.useState("ALL");
  const [platform, setPlatform] = React.useState("ALL");
  const [tag, setTag] = React.useState("ALL");
  const [company, setCompany] = React.useState("ALL");
  const [solvedFilter, setSolvedFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [companies, setCompanies] = React.useState<string[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setSearch(urlQ);
  }, [urlQ]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (difficulty !== "ALL") params.set("difficulty", difficulty);
      if (platform !== "ALL") params.set("platform", platform);
      if (tag !== "ALL") params.set("tag", tag);
      if (company !== "ALL") params.set("company", company);
      if (solvedFilter === "SOLVED") params.set("solved", "true");
      if (solvedFilter === "UNSOLVED") params.set("solved", "false");
      params.set("page", String(page));
      params.set("limit", "20");

      apiFetch<{
        problems: Problem[];
        total: number;
        pages: number;
        tags: string[];
        companies: string[];
      }>(`/api/problems?${params}`, { userId })
        .then((data) => {
          setProblems(data.problems);
          setTotal(data.total);
          setPages(data.pages);
          setTags(data.tags);
          setCompanies(data.companies);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, difficulty, platform, tag, company, solvedFilter, page, userId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Problems across platforms — click to open on the original site
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title or tag…"
          className="h-11 pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={platform}
          onChange={(v) => {
            setPlatform(v);
            setPage(1);
          }}
          options={[
            "ALL",
            "LEETCODE",
            "CODEFORCES",
            "CSES",
            "GFG",
            "ATCODER",
            "CODECHEF",
          ]}
          label={(v) => (v === "ALL" ? "Platform" : platformLabel(v))}
        />
        <Select
          value={difficulty}
          onChange={(v) => {
            setDifficulty(v);
            setPage(1);
          }}
          options={["ALL", "EASY", "MEDIUM", "HARD", "EXPERT"]}
          label={(v) => (v === "ALL" ? "Difficulty" : v)}
        />
        <Select
          value={tag}
          onChange={(v) => {
            setTag(v);
            setPage(1);
          }}
          options={["ALL", ...tags]}
          label={(v) => (v === "ALL" ? "Tag" : v)}
        />
        <Select
          value={company}
          onChange={(v) => {
            setCompany(v);
            setPage(1);
          }}
          options={["ALL", ...companies]}
          label={(v) => (v === "ALL" ? "Company" : v)}
        />
        <Select
          value={solvedFilter}
          onChange={(v) => {
            setSolvedFilter(v);
            setPage(1);
          }}
          options={["ALL", "SOLVED", "UNSOLVED"]}
          label={(v) =>
            v === "ALL" ? "Status" : v === "SOLVED" ? "Solved" : "Unsolved"
          }
        />
      </div>

      {loading ? (
        <div className="flex items-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{total} problems</p>
          <div className="space-y-2">
            {problems.map((p) => (
              <Card key={p.id} className="transition hover:border-primary/30">
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  {p.solved ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <div className="h-4 w-4 shrink-0 rounded-full border border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={p.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {p.title}
                      </a>
                      <Badge variant="secondary" className="text-[10px]">
                        {platformLabel(p.platform)}
                      </Badge>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          difficultyColor(p.difficulty)
                        )}
                      >
                        {p.difficulty}
                      </span>
                      {p.rating != null && (
                        <span className="text-xs text-muted-foreground">
                          {p.rating}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.tags.slice(0, 6).map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="cursor-pointer text-[10px]"
                          onClick={() => {
                            setTag(t);
                            setPage(1);
                          }}
                        >
                          {t}
                        </Badge>
                      ))}
                      {p.companies.slice(0, 3).map((c) => (
                        <Badge key={c} variant="secondary" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {p.url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={p.url} target="_blank" rel="noreferrer">
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {problems.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No problems match your filters.
              </p>
            )}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} / {pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: (v: string) => string;
}) {
  return (
    <select
      className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {label(o)}
        </option>
      ))}
    </select>
  );
}
