"use client";

import { Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unlock badges as you solve problems and grow streaks
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4" /> Coming from your real activity
          </CardTitle>
          <CardDescription>
            Achievements will unlock automatically based on synced solves, streaks, and
            contests — not demo data.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect platforms in Settings and keep practicing. Badge unlocks will appear
          here as you hit milestones.
        </CardContent>
      </Card>
    </div>
  );
}
