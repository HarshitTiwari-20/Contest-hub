"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, Search, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui-store";

function initials(name?: string | null, username?: string) {
  if (name?.trim()) {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (username ?? "?").slice(0, 2).toUpperCase();
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const { setCommandOpen, setSidebarOpen, sidebarOpen } = useUIStore();
  const { data: session } = useSession();
  const user = session?.user;
  const profileHref = user?.username
    ? `/profile/${user.username}`
    : "/settings";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-muted/30 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sign out"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
        </Button>

        <Link href={profileHref} className="ml-1">
          <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-border transition hover:ring-primary/40">
            <AvatarFallback className="text-xs">
              {initials(user?.name, user?.username)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
