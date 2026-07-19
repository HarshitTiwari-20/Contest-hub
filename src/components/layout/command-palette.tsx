"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Calendar,
  Search,
  BarChart3,
  Sparkles,
  Map,
  Users,
  Target,
  Trophy,
  Building2,
  StickyNote,
  MessageSquare,
  Settings,
  Award,
  User,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const pages = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contests", label: "Contests", icon: Calendar },
  { href: "/problems", label: "Problems", icon: Search },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function CommandPalette() {
  const router = useRouter();
  const { data: session } = useSession();
  const { commandOpen, setCommandOpen } = useUIStore();
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<
    { type: string; id: string; title: string; meta?: string; url?: string }[]
  >([]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandOpen, setCommandOpen]);

  React.useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      apiFetch<{ results: typeof results }>(
        `/api/search?q=${encodeURIComponent(search)}`,
        { userId: session?.user?.id }
      )
        .then((d) => setResults(d.results))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [search, session?.user?.id]);

  const go = (href: string) => {
    setCommandOpen(false);
    setSearch("");
    router.push(href);
  };

  if (!commandOpen) return null;

  const q = search.toLowerCase();
  const profileHref = session?.user?.username
    ? `/profile/${session.user.username}`
    : "/settings";

  const navPages = [
    ...pages,
    { href: profileHref, label: "My Profile", icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => setCommandOpen(false)}
      />
      <div className="relative mx-auto mt-[12vh] w-full max-w-xl px-4">
        <Command
          className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          shouldFilter={false}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, problems, users…"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Pages"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {navPages
                .filter((p) => !q || p.label.toLowerCase().includes(q))
                .map((p) => (
                  <CommandItem key={p.href} onSelect={() => go(p.href)}>
                    <p.icon className="h-4 w-4 text-muted-foreground" />
                    {p.label}
                  </CommandItem>
                ))}
            </Command.Group>

            {results.length > 0 && (
              <Command.Group
                heading="Results"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {results.map((r) => (
                  <CommandItem
                    key={`${r.type}-${r.id}`}
                    onSelect={() => {
                      if (r.type === "problem" && r.url) {
                        window.open(r.url, "_blank");
                        setCommandOpen(false);
                      } else if (r.type === "roadmap") {
                        go(`/roadmaps/${r.id}`);
                      } else if (r.type === "user") {
                        go(`/profile/${r.meta}`);
                      } else {
                        go("/problems");
                      }
                    }}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{r.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {r.meta}
                    </span>
                  </CommandItem>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  children,
  onSelect,
  className,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        className
      )}
    >
      {children}
    </Command.Item>
  );
}
