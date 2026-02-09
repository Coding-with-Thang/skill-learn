/**
 * Backfill slug for all chapters and lessons from their titles.
 * Run from repo root: npm run backfill-course-slugs
 * Or from apps/lms: node scripts/run-backfill-slugs.js
 *
 * Options (env):
 *   DRY_RUN=1  - Log what would be updated without writing to DB
 */

const path = require("path");
const fs = require("fs");

// Load .env from repo root or apps/lms
try {
  const dotenv = require("dotenv");
  const rootEnv = path.resolve(__dirname, "../../../.env");
  const lmsEnv = path.resolve(__dirname, "../.env");
  if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  } else if (fs.existsSync(lmsEnv)) {
    dotenv.config({ path: lmsEnv });
  }
} catch (_) {
  // dotenv not installed; rely on env vars (e.g. CI)
}

const { prisma } = require("@skill-learn/database");
const { backfillChapterAndLessonSlugs } = require("../lib/backfillSlugs.js");

const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

async function main() {
  console.log("Backfilling chapter and lesson slugs from titles...");
  if (dryRun) console.log("DRY RUN – no changes will be written.\n");

  try {
    const result = await backfillChapterAndLessonSlugs(prisma, {
      dryRun,
      verbose: process.env.VERBOSE === "1" || process.env.VERBOSE === "true",
      log: (msg) => console.log(msg),
    });

    console.log("\nDone.");
    console.log(`Chapters updated: ${result.chaptersUpdated}`);
    console.log(`Lessons updated: ${result.lessonsUpdated}`);
    console.log(`Tenants with courses processed: ${result.tenantsProcessed}`);
    if (dryRun) console.log("\nRun without DRY_RUN=1 to apply changes.");
  } catch (err) {
    console.error("Backfill failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
