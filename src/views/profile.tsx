"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Flame, Loader2, MapPin, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CodingHeatmap } from "@/components/charts/heatmap";
import { RatingChart } from "@/components/charts/rating-chart";
import { apiFetch } from "@/lib/api-client";
import { formatNumber, platformLabel } from "@/lib/utils";

type ProfileData = {
  user: {
    username: string;
    name: string | null;
    bio: string | null;
    country: string | null;
    college: string | null;
    xp: number;
    level: number;
    streak: number;
  };
  accounts: {
    platform: string;
    handle: string;
    rating: number | null;
    solvedCount: number;
    rank: string | null;
  }[];
  stats: {
    totalSolved: number;
    currentRating: number;
    streak: number;
  };
  ratingHistory: { date: string; rating: number }[];
  heatmap: { date: string; count: number }[];
};

export default function ProfilePage() {
  const params = useParams<{ username?: string; slug?: string[] }>();
  const pathname = usePathname();
  // Support both /profile/[username] route shape and catch-all [...slug]
  const username =
    params.username ||
    (Array.isArray(params.slug) && params.slug[0] === "profile"
      ? params.slug[1]
      : undefined) ||
    pathname.split("/").filter(Boolean)[1] ||
    "";
  const { data: session } = useSession();
  const isMe =
    username === session?.user?.username || username === "me";
  const profileUsername =
    username === "me" ? session?.user?.username : username;

  const [data, setData] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!profileUsername) return;
    setLoading(true);
    apiFetch<ProfileData>(`/api/profile/${profileUsername}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [profileUsername]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading profile…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium">{error || "User not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const user = data.user;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-6 py-6">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {(user.name ?? user.username)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {user.name ?? user.username}
              </h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              {user.bio && (
                <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {user.country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {user.country}
                  </span>
                )}
                {user.college && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" /> {user.college}
                  </span>
                )}
                {user.streak > 0 && (
                  <span className="inline-flex items-center gap-1 text-orange-500">
                    <Flame className="h-3.5 w-3.5" /> {user.streak} day streak
                  </span>
                )}
              </div>
            </div>
            {isMe && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">Edit / connect platforms</Link>
              </Button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Level" value={String(user.level)} />
            <Stat label="XP" value={formatNumber(user.xp)} />
            <Stat label="Solved" value={formatNumber(data.stats.totalSolved)} />
            <Stat label="Rating" value={String(data.stats.currentRating || "—")} />
          </div>
        </CardContent>
      </Card>

      {data.accounts.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.accounts.map((a) => (
                <div
                  key={a.platform}
                  className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {platformLabel(a.platform)}{" "}
                    <span className="text-muted-foreground">@{a.handle}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {a.solvedCount} solved
                    {a.rating != null ? ` · ${a.rating}` : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>From synced platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <CodingHeatmap data={data.heatmap} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingChart data={data.ratingHistory} />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {isMe
              ? "Connect a platform in Settings to show real stats here."
              : "This user has not connected any platforms yet."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
