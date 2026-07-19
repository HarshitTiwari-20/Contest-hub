"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api-client";

type Roadmap = {
  slug: string;
  title: string;
  description: string;
  category: string;
  completed: number;
  total: number;
  progress: number;
};

export default function RoadmapsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [roadmaps, setRoadmaps] = React.useState<Roadmap[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<{ roadmaps: Roadmap[] }>("/api/roadmaps", { userId })
      .then((d) => setRoadmaps(d.roadmaps))
      .finally(() => setLoading(false));
  }, [userId]);

  const categories = Array.from(new Set(roadmaps.map((r) => r.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading roadmaps…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roadmaps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Progress is computed from problems you have solved on connected platforms
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {cat}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {roadmaps
              .filter((r) => r.category === cat)
              .map((r) => (
                <Link key={r.slug} href={`/roadmaps/${r.slug}`}>
                  <Card className="h-full transition hover:border-primary/40">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          {r.title}
                        </CardTitle>
                        <Badge variant="secondary">{r.progress}%</Badge>
                      </div>
                      <CardDescription>{r.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={r.progress} />
                      <p className="mt-2 text-xs text-muted-foreground">
                        {r.completed}/{r.total} problems solved
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
