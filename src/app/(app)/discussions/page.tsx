"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Heart, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { relativeTime } from "@/lib/utils";

type Discussion = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  author: string;
  comments: number;
  createdAt: string;
};

export default function DiscussionsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const data = await apiFetch<{ discussions: Discussion[] }>("/api/discussions");
    setDiscussions(data.discussions);
  }, []);

  React.useEffect(() => {
    load()
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function createPost() {
    if (!userId) return;
    setSaving(true);
    try {
      await apiFetch("/api/discussions", {
        method: "POST",
        userId,
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      toast.success("Post published");
      setTitle("");
      setContent("");
      setTags("");
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function like(id: string) {
    if (!userId) return;
    try {
      const res = await apiFetch<{ likes: number }>(`/api/discussions/${id}/like`, {
        method: "POST",
        userId,
      });
      setDiscussions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, likes: res.likes } : d))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading discussions…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Discussions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Community posts stored in the database
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>New post</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to approach digit DP?"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an approach, editorial, or question…"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="dp, editorial"
              />
            </div>
            <Button onClick={createPost} disabled={saving || !title.trim() || !content.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {discussions.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-1.5">
                {d.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
              <h3 className="mt-2 text-base font-semibold">{d.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {d.content}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                by @{d.author} · {relativeTime(d.createdAt)}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() => like(d.id)}
                >
                  <Heart className="h-3.5 w-3.5" /> {d.likes}
                </button>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> {d.comments}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {discussions.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No discussions yet. Be the first to post.
          </p>
        )}
      </div>
    </div>
  );
}
