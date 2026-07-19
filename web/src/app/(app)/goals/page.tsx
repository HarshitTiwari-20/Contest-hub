"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  period: string;
  target: number;
  current: number;
  metric: string;
  isCompleted: boolean;
};

type Template = {
  key: string;
  title: string;
  description: string;
  period: string;
  target: number;
  metric: string;
};

export default function GoalsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState(5);
  const [period, setPeriod] = React.useState("WEEKLY");
  const [metric, setMetric] = React.useState("problems");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!userId) return;
    const data = await apiFetch<{ goals: Goal[]; templates: Template[] }>(
      "/api/goals",
      { userId }
    );
    setGoals(data.goals);
    setTemplates(data.templates);
  }, [userId]);

  React.useEffect(() => {
    load()
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function createCustom() {
    if (!userId || !title.trim()) return;
    setSaving(true);
    try {
      await apiFetch("/api/goals", {
        method: "POST",
        userId,
        body: JSON.stringify({
          title: title.trim(),
          period,
          target: Number(target),
          metric,
        }),
      });
      toast.success("Goal created");
      setTitle("");
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function createFromTemplate(key: string) {
    if (!userId) return;
    try {
      await apiFetch("/api/goals", {
        method: "POST",
        userId,
        body: JSON.stringify({
          title: "tmp",
          period: "WEEKLY",
          target: 1,
          metric: "problems",
          templateKey: key,
        }),
      });
      toast.success("Goal added from template");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function bump(goal: Goal, delta: number) {
    if (!userId) return;
    try {
      // Prefer POST progress endpoint (more reliable than PATCH)
      await apiFetch(`/api/goals/${goal.id}/progress`, {
        method: "POST",
        userId,
        body: JSON.stringify({ delta }),
      });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update progress");
    }
  }

  async function remove(id: string) {
    if (!userId) return;
    await apiFetch(`/api/goals/${id}`, { method: "DELETE", userId });
    toast.success("Goal removed");
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading goals…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your own targets — no demo data
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create goal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Solve 5 DP problems"
              />
            </div>
            <div className="space-y-2">
              <Label>Target</Label>
              <Input
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Metric</Label>
              <Input
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder="problems"
              />
            </div>
            <Button onClick={createCustom} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick templates
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => createFromTemplate(t.key)}
              className="rounded-xl border border-border p-4 text-left transition hover:border-primary/40 hover:bg-muted/30"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-primary" />
                {t.title}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t.period} · {t.target} {t.metric}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <Card key={g.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{g.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {g.current} / {g.target} {g.metric}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{g.period}</Badge>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => remove(g.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={pct} className="h-2.5" />
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => bump(g, -1)}>
                    −
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bump(g, 1)}>
                    + progress
                  </Button>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {pct}%
                    {g.isCompleted ? " · done" : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No goals yet. Use a template or create your own.
        </p>
      )}
    </div>
  );
}
