"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlatformConnectPanel } from "@/components/connect-platforms";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile and platform connections
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear across Contest Hub</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" defaultValue={user?.name ?? ""} key={user?.name ?? "name"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              defaultValue={user?.username ?? ""}
              key={user?.username ?? "username"}
              disabled
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email ?? ""}
              key={user?.email ?? "email"}
              disabled
            />
          </div>
          <Button
            className="w-fit"
            onClick={() => toast.success("Profile preferences saved locally")}
          >
            Save profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected platforms</CardTitle>
          <CardDescription>
            Connect Codeforces or LeetCode for full sync. Other platforms store your handle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformConnectPanel />
        </CardContent>
      </Card>
    </div>
  );
}
