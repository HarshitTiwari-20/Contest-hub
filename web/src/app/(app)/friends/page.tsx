"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Copy, Flame, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

type SocialUser = {
  id: string;
  username: string;
  name: string;
  solved: number;
  streak: number;
  xp: number;
  rating: number;
  college: string | null;
  country: string | null;
};

export default function FriendsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading friends…
        </div>
      }
    >
      <FriendsContent />
    </Suspense>
  );
}

function FriendsContent() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite");

  const [following, setFollowing] = React.useState<SocialUser[]>([]);
  const [followers, setFollowers] = React.useState<SocialUser[]>([]);
  const [inviteCode, setInviteCode] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!userId) return;
    const data = await apiFetch<{
      following: SocialUser[];
      followers: SocialUser[];
      inviteCode: string | null;
    }>("/api/friends", { userId });
    setFollowing(data.following);
    setFollowers(data.followers);
    setInviteCode(data.inviteCode);
  }, [userId]);

  React.useEffect(() => {
    load()
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  React.useEffect(() => {
    if (!userId || !inviteFromUrl) return;
    apiFetch("/api/friends/accept-invite", {
      method: "POST",
      userId,
      body: JSON.stringify({ code: inviteFromUrl }),
    })
      .then(() => {
        toast.success("Invite accepted — you are now friends");
        return load();
      })
      .catch((e) => toast.error(e.message));
  }, [userId, inviteFromUrl, load]);

  async function copyText(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through */
    }
    // Fallback for non-secure contexts
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }

  async function createInvite() {
    if (!userId) return;
    try {
      const data = await apiFetch<{ code: string }>("/api/friends/invite", {
        method: "POST",
        userId,
      });
      setInviteCode(data.code);
      const link = `${window.location.origin}/friends?invite=${data.code}`;
      const ok = await copyText(link);
      if (ok) {
        toast.success("Invite link copied");
      } else {
        toast.message("Your invite link", { description: link });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create invite");
    }
  }

  async function copyInvite() {
    if (!inviteCode) {
      await createInvite();
      return;
    }
    const link = `${window.location.origin}/friends?invite=${inviteCode}`;
    const ok = await copyText(link);
    if (ok) toast.success("Invite link copied");
    else toast.message("Your invite link", { description: link });
  }

  async function follow() {
    if (!userId || !username.trim()) return;
    try {
      await apiFetch("/api/friends/follow", {
        method: "POST",
        userId,
        body: JSON.stringify({ username: username.trim() }),
      });
      toast.success(`Following @${username.trim()}`);
      setUsername("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function unfollow(u: string) {
    if (!userId) return;
    await apiFetch(`/api/friends/${u}`, { method: "DELETE", userId });
    toast.success("Unfollowed");
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading friends…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow users or share an invite link
          </p>
        </div>
        <Button onClick={copyInvite}>
          <Copy className="h-4 w-4" /> Copy invite link
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find by username</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && follow()}
          />
          <Button onClick={follow}>
            <UserPlus className="h-4 w-4" /> Follow
          </Button>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Following ({following.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {following.map((f) => (
            <UserCard key={f.id} user={f} onUnfollow={() => unfollow(f.username)} />
          ))}
          {following.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You are not following anyone yet.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Followers ({followers.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {followers.map((f) => (
            <UserCard key={f.id} user={f} />
          ))}
          {followers.length === 0 && (
            <p className="text-sm text-muted-foreground">No followers yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function UserCard({
  user: f,
  onUnfollow,
}: {
  user: SocialUser;
  onUnfollow?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
        <Avatar>
          <AvatarFallback>
            {f.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">
            <Link href={`/profile/${f.username}`} className="hover:text-primary">
              {f.name}
            </Link>
          </CardTitle>
          <p className="text-xs text-muted-foreground">@{f.username}</p>
        </div>
        {f.rating > 0 && <Badge variant="secondary">{f.rating}</Badge>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="font-semibold">{formatNumber(f.solved)}</p>
            <p className="text-muted-foreground">Solved</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="flex items-center justify-center gap-0.5 font-semibold text-orange-500">
              <Flame className="h-3 w-3" /> {f.streak}
            </p>
            <p className="text-muted-foreground">Streak</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="font-semibold">{formatNumber(f.xp)}</p>
            <p className="text-muted-foreground">XP</p>
          </div>
        </div>
        {(f.college || f.country) && (
          <p className="mt-3 text-xs text-muted-foreground">
            {[f.college, f.country].filter(Boolean).join(" · ")}
          </p>
        )}
        {onUnfollow && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            onClick={onUnfollow}
          >
            Unfollow
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
