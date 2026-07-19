"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Code2,
  Loader2,
  Target,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import DashboardPage from "@/views/dashboard";
import ContestsPage from "@/views/contests";
import ProblemsPage from "@/views/problems";
import PracticePage from "@/views/practice";
import AnalyticsPage from "@/views/analytics";
import RoadmapsPage from "@/views/roadmaps";
import RoadmapDetailPage from "@/views/roadmap-detail";
import CompaniesPage from "@/views/companies";
import GoalsPage from "@/views/goals";
import AchievementsPage from "@/views/achievements";
import NotesPage from "@/views/notes";
import FriendsPage from "@/views/friends";
import LeaderboardPage from "@/views/leaderboard";
import DiscussionsPage from "@/views/discussions";
import SettingsPage from "@/views/settings";
import ProfilePage from "@/views/profile";

const PUBLIC = new Set(["", "login", "register"]);

const APP_ROOTS = new Set([
  "dashboard",
  "contests",
  "problems",
  "practice",
  "analytics",
  "roadmaps",
  "companies",
  "goals",
  "achievements",
  "notes",
  "friends",
  "leaderboard",
  "discussions",
  "settings",
  "profile",
]);

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Contest Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center md:pt-28">
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          Competitive programming dashboard
        </p>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Track contests, stats, and growth in one place
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground">
          Connect your platforms, monitor performance, and stay consistent —
          without juggling tabs and spreadsheets.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Calendar,
              title: "Contest calendar",
              description: "Upcoming contests from major platforms in one view.",
            },
            {
              icon: BarChart3,
              title: "Unified analytics",
              description: "Ratings, heatmaps, and topic mastery across accounts.",
            },
            {
              icon: Target,
              title: "Practice & goals",
              description: "Daily targets, problem sheets, and progress tracking.",
            },
            {
              icon: Trophy,
              title: "Leaderboards",
              description: "Compare with friends and climb global rankings.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border/60 bg-card p-5 text-left"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Contest Hub
      </footer>
    </div>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Contest Hub</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

function AppContent({ root, segments }: { root: string; segments: string[] }) {
  switch (root) {
    case "dashboard":
      return <DashboardPage />;
    case "contests":
      return <ContestsPage />;
    case "problems":
      return <ProblemsPage />;
    case "practice":
      return <PracticePage />;
    case "analytics":
      return <AnalyticsPage />;
    case "roadmaps":
      return segments.length > 1 ? <RoadmapDetailPage /> : <RoadmapsPage />;
    case "companies":
      return <CompaniesPage />;
    case "goals":
      return <GoalsPage />;
    case "achievements":
      return <AchievementsPage />;
    case "notes":
      return <NotesPage />;
    case "friends":
      return <FriendsPage />;
    case "leaderboard":
      return <LeaderboardPage />;
    case "discussions":
      return <DiscussionsPage />;
    case "settings":
      return <SettingsPage />;
    case "profile":
      return <ProfilePage />;
    default:
      return <DashboardPage />;
  }
}

/**
 * Single client app for all UI routes — keeps Vercel Hobby under the
 * 12 serverless-function limit (only NextAuth API + this page remain).
 */
export function AppRoute() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { data: session, status } = useSession();
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0] || "";
  const isPublic = PUBLIC.has(root);
  const isLoggedIn = status === "authenticated" && !!session?.user;

  React.useEffect(() => {
    if (status === "loading") return;

    if (!isLoggedIn && !isPublic) {
      const login = new URL("/login", window.location.origin);
      login.searchParams.set("callbackUrl", pathname);
      router.replace(login.pathname + login.search);
      return;
    }

    if (isLoggedIn && (root === "login" || root === "register")) {
      router.replace("/dashboard");
      return;
    }

    if (isLoggedIn && root === "") {
      router.replace("/dashboard");
      return;
    }

    if (isLoggedIn && root && !APP_ROOTS.has(root) && !isPublic) {
      router.replace("/dashboard");
    }
  }, [status, isLoggedIn, isPublic, root, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  // Public pages
  if (root === "" && !isLoggedIn) {
    return <Landing />;
  }

  if (root === "login" && !isLoggedIn) {
    return (
      <AuthShell title="Welcome back" subtitle="Sign in to your Contest Hub account">
        <React.Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
          <LoginForm />
        </React.Suspense>
      </AuthShell>
    );
  }

  if (root === "register" && !isLoggedIn) {
    return (
      <AuthShell title="Create your account" subtitle="Start tracking contests and progress">
        <RegisterForm />
      </AuthShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  return (
    <AppShell>
      <AppContent root={root || "dashboard"} segments={segments} />
    </AppShell>
  );
}
