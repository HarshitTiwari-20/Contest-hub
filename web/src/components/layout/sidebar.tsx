"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Code2,
  Flame,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contests", label: "Contests", icon: Calendar },
  { href: "/problems", label: "Problems", icon: Search },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const secondaryNav = [
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/notes", label: "Notes", icon: StickyNote },
];

const socialNav = [
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavSection({
  items,
  sidebarOpen,
  pathname,
}: {
  items: typeof primaryNav;
  sidebarOpen: boolean;
  pathname: string;
}) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const link = (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
            {sidebarOpen && <span className="truncate">{item.label}</span>}
          </Link>
        );

        if (!sidebarOpen) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        }
        return link;
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data: session } = useSession();
  const streak = session?.user?.streak ?? 0;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-background transition-all duration-200",
        sidebarOpen ? "w-56" : "w-[64px]"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </div>
          {sidebarOpen && (
            <span className="truncate text-sm font-semibold tracking-tight">
              CP Hub
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-2 scrollbar-thin">
        <NavSection items={primaryNav} sidebarOpen={sidebarOpen} pathname={pathname} />
        {sidebarOpen && (
          <p className="px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Learn
          </p>
        )}
        <NavSection items={secondaryNav} sidebarOpen={sidebarOpen} pathname={pathname} />
        {sidebarOpen && (
          <p className="px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Social
          </p>
        )}
        <NavSection items={socialNav} sidebarOpen={sidebarOpen} pathname={pathname} />
      </nav>

      <div className="border-t border-border p-2">
        {streak > 0 && (
          <div
            className={cn(
              "mb-2 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2",
              !sidebarOpen && "justify-center px-0"
            )}
          >
            <Flame className="h-4 w-4 shrink-0 text-orange-500" />
            {sidebarOpen && (
              <p className="text-xs font-medium">{streak} day streak</p>
            )}
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4" /> Collapse
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
