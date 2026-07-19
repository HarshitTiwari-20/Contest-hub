"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Link2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { platformLabel } from "@/lib/utils";

type Account = {
  id: string;
  platform: string;
  handle: string;
  rating: number | null;
  solvedCount: number;
  rank: string | null;
  lastSyncedAt: string | null;
};

const PLATFORMS = [
  { id: "CODEFORCES", label: "Codeforces", hint: "Full sync (ratings, submissions)" },
  { id: "LEETCODE", label: "LeetCode", hint: "Full sync (solved, contest rating)" },
  { id: "CODECHEF", label: "CodeChef", hint: "Connect handle" },
  { id: "ATCODER", label: "AtCoder", hint: "Connect handle" },
  { id: "GFG", label: "GeeksforGeeks", hint: "Connect handle" },
  { id: "CSES", label: "CSES", hint: "Connect handle" },
  { id: "GITHUB", label: "GitHub", hint: "Connect username" },
] as const;

export function ConnectPlatformsBanner({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" /> Connect your accounts
        </CardTitle>
        <CardDescription>
          Link Codeforces, LeetCode, or other platforms to load real stats, heatmaps,
          and solved progress. Nothing is shown until you connect.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/settings">Connect platforms</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PlatformConnectPanel({
  onChanged,
}: {
  onChanged?: () => void;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [platform, setPlatform] = React.useState<string>("CODEFORCES");
  const [handle, setHandle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [syncing, setSyncing] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!userId) return;
    const data = await apiFetch<{ accounts: Account[] }>("/api/platforms", {
      userId,
    });
    setAccounts(data.accounts);
  }, [userId]);

  React.useEffect(() => {
    load().catch(() => {});
  }, [load]);

  async function connect() {
    if (!userId || !handle.trim()) return;
    setLoading(true);
    try {
      await apiFetch("/api/platforms/connect", {
        method: "POST",
        userId,
        body: JSON.stringify({ platform, handle: handle.trim() }),
      });
      toast.success(`${platformLabel(platform)} connected and synced`);
      setHandle("");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  async function sync(p: string) {
    if (!userId) return;
    setSyncing(p);
    try {
      await apiFetch(`/api/platforms/${p}/sync`, {
        method: "POST",
        userId,
      });
      toast.success(`${platformLabel(p)} re-synced`);
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(null);
    }
  }

  async function disconnect(p: string) {
    if (!userId) return;
    try {
      await apiFetch(`/api/platforms/${p}`, { method: "DELETE", userId });
      toast.success("Disconnected");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Platform</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Handle / username</Label>
          <div className="flex gap-2">
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="your_handle"
              onKeyDown={(e) => e.key === "Enter" && connect()}
            />
            <Button onClick={connect} disabled={loading || !handle.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {PLATFORMS.find((p) => p.id === platform)?.hint}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">No platforms connected yet.</p>
        )}
        {accounts.map((a) => (
          <div
            key={a.platform}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">
                {platformLabel(a.platform)}{" "}
                <span className="text-muted-foreground">@{a.handle}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {a.solvedCount} solved
                {a.rating != null ? ` · rating ${a.rating}` : ""}
                {a.rank ? ` · ${a.rank}` : ""}
                {a.lastSyncedAt
                  ? ` · synced ${new Date(a.lastSyncedAt).toLocaleString()}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Connected</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sync(a.platform)}
                disabled={syncing === a.platform}
              >
                {syncing === a.platform ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Sync
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => disconnect(a.platform)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
