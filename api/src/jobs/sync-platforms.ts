/**
 * BullMQ workers for platform data sync.
 * Wire REDIS_URL and platform scrapers/APIs in production.
 *
 * Example flow:
 *  1. User connects Codeforces handle
 *  2. Enqueue `platform-sync` job with { userId, platform, handle }
 *  3. Worker fetches CF API, updates PlatformAccount + Submission rows
 *  4. Invalidate Redis cache keys for user dashboard
 */

export type PlatformSyncJob = {
  userId: string;
  platform: string;
  handle: string;
};

export async function enqueuePlatformSync(_job: PlatformSyncJob): Promise<void> {
  // Placeholder — enable when Redis + BullMQ workers are deployed:
  // const queue = new Queue("platform-sync", { connection: redis });
  // await queue.add("sync", job, { attempts: 3, backoff: { type: "exponential", delay: 2000 } });
  console.info("[sync] enqueue skipped (demo mode)", _job.platform, _job.handle);
}

export async function processPlatformSync(job: PlatformSyncJob): Promise<void> {
  console.info("[sync] process", job);
  // Implement per-platform fetchers here (Codeforces API, LeetCode GraphQL, …)
}
