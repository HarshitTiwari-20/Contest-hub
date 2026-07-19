"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Loader2, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { relativeTime } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  problemTitle: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function NotesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!userId) return;
    const data = await apiFetch<{ notes: Note[] }>("/api/notes", { userId });
    setNotes(data.notes);
  }, [userId]);

  React.useEffect(() => {
    load()
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function createNote() {
    if (!userId || !title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await apiFetch("/api/notes", {
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
      toast.success("Note saved");
      setTitle("");
      setContent("");
      setTags("");
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!userId) return;
    await apiFetch(`/api/notes/${id}`, { method: "DELETE", userId });
    toast.success("Note deleted");
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading notes…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved to your account in the database
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <StickyNote className="h-4 w-4" /> New note
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Write a note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Binary search template"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write markdown or plain text…"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="dp, binary-search"
              />
            </div>
            <Button onClick={createNote} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save note"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((n) => (
          <Card key={n.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{n.title}</CardTitle>
                <CardDescription>
                  {n.problemTitle ? `${n.problemTitle} · ` : ""}
                  {relativeTime(n.updatedAt)}
                </CardDescription>
              </div>
              <Button size="icon-sm" variant="ghost" onClick={() => remove(n.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="mb-3 max-h-28 overflow-hidden whitespace-pre-wrap rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
                {n.content}
              </pre>
              <div className="flex flex-wrap gap-1">
                {n.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No notes yet. Create one to save it permanently.
        </p>
      )}
    </div>
  );
}
