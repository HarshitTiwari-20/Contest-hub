import { AppRoute } from "@/components/app-route";

/**
 * Single page for the entire UI. Required for Vercel Hobby (max 12
 * serverless functions). Auth API stays at /api/auth/[...nextauth].
 */
export default function Page() {
  return <AppRoute />;
}
