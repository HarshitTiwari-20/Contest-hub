import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import {
  CATALOG_PROBLEMS,
  ROADMAP_SEEDS,
} from "../src/data/catalog.js";

async function main() {
  console.log("Seeding problems…");
  for (const p of CATALOG_PROBLEMS) {
    await prisma.problem.upsert({
      where: {
        platform_externalId: {
          platform: p.platform,
          externalId: p.externalId,
        },
      },
      create: {
        platform: p.platform,
        externalId: p.externalId,
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        rating: p.rating ?? null,
        tags: p.tags,
        companies: p.companies,
        frequency: p.frequency ?? null,
      },
      update: {
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        rating: p.rating ?? null,
        tags: p.tags,
        companies: p.companies,
        frequency: p.frequency ?? null,
      },
    });
  }

  console.log("Seeding roadmaps…");
  for (const r of ROADMAP_SEEDS) {
    await prisma.roadmap.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        title: r.title,
        description: r.description,
        category: r.category,
        order: r.order,
        nodes: r.nodes,
      },
      update: {
        title: r.title,
        description: r.description,
        category: r.category,
        order: r.order,
        nodes: r.nodes,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
