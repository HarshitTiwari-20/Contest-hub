import { AppRoute } from "@/components/app-route";

/**
 * One dynamic route for the whole authenticated app.
 * Vercel Hobby allows only 12 serverless functions — individual
 * page routes would exceed that limit.
 */
export default function AppCatchAllPage() {
  return <AppRoute />;
}
