"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/api-client";
import { cn, formatNumber } from "@/lib/utils";

type Row = {
  rank: number;
  id: string;
  username: string;
  name: string;
  xp: number;
  streak: number;
  solved: number;
  rating: number;
};

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [scope, setScope] = React.useState("global");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ scope });
    if (userId) params.set("userId", userId);
    apiFetch<{ leaderboard: Row[] }>(`/api/leaderboard?${params}`)
      .then((d) => setRows(d.leaderboard))
      .finally(() => setLoading(false));
  }, [scope, userId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real users ranked by XP and activity
        </p>
      </div>

      <Tabs value={scope} onValueChange={setScope}>
        <TabsList>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {scope === "friends" ? "Friends" : "Global"} rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              {scope === "friends"
                ? "Follow friends to see them here."
                : "No users yet."}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    r.username === session?.user?.username && "bg-primary/5"
                  )}
                >
                  <span className="w-8 text-center text-sm font-semibold text-muted-foreground">
                    #{r.rank}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {r.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${r.username}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {r.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{r.username}</p>
                  </div>
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <p>{formatNumber(r.solved)} solved</p>
                    <p>{r.streak}d streak</p>
                  </div>
                  <div className="w-16 text-right text-sm font-semibold">
                    {formatNumber(r.xp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
