"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
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

/**
 * Single client router for all authenticated app pages.
 * Keeps Vercel Hobby under the 12 serverless-function limit by using
 * one catch-all route instead of one function per page.
 */
export function AppRoute() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0] || "dashboard";

  React.useEffect(() => {
    const known = new Set([
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
    if (!known.has(root)) {
      router.replace("/dashboard");
    }
  }, [root, router]);

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
