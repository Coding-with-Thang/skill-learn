/**
 * Validate MongoDB data against Prisma schema and optionally clean orphans.
 *
 * Prisma + MongoDB does not enforce schema; this script helps ensure data aligns
 * with the current schema.
 *
 * Usage:
 *   node packages/database/scripts/validate-mongo-schema.js              # Report only (dry-run)
 *   node packages/database/scripts/validate-mongo-schema.js --fix        # Apply fixes
 *   node packages/database/scripts/validate-mongo-schema.js --remove-orphans  # Remove orphaned records
 *
 * Or: npm run db:validate (from repo root)
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env.local") });

const { PrismaClient } = require("@prisma/client");
// ObjectId from @prisma/client/runtime (via mongodb under the hood)
const { ObjectId } = require("bson");

const prisma = new PrismaClient();

const ARGS = {
  fix: process.argv.includes("--fix"),
  removeOrphans: process.argv.includes("--remove-orphans"),
};

// Orphan definitions: { collection, parentCollection, fkField }
// Child records whose fkField references a non-existent parent are orphans
const ORPHAN_RULES = [
  { collection: "point_logs", parentCollection: "users", fkField: "userId" },
  { collection: "category_stats", parentCollection: "users", fkField: "userId" },
  { collection: "category_stats", parentCollection: "categories", fkField: "categoryId" },
  { collection: "reward_logs", parentCollection: "users", fkField: "userId" },
  { collection: "reward_logs", parentCollection: "Reward", fkField: "rewardId" },
  { collection: "audit_logs", parentCollection: "users", fkField: "userId" },
  { collection: "flash_card_progress", parentCollection: "users", fkField: "userId" },
  { collection: "flash_card_progress", parentCollection: "flash_cards", fkField: "flashCardId" },
  { collection: "flash_card_access", parentCollection: "users", fkField: "userId" },
  { collection: "flash_card_access", parentCollection: "flash_cards", fkField: "flashCardId" },
  { collection: "course_chapters", parentCollection: "Course", fkField: "courseId" },
  { collection: "course_lessons", parentCollection: "course_chapters", fkField: "courseChapterId" },
  { collection: "questions", parentCollection: "quizzes", fkField: "quizId" },
  { collection: "options", parentCollection: "questions", fkField: "questionId" },
  { collection: "flash_card_deck_shares", parentCollection: "flash_card_decks", fkField: "deckId" },
  { collection: "flash_card_deck_shares", parentCollection: "users", fkField: "sharedTo" },
];

async function findOrphans(rule) {
  // Use $lookup to find children whose parent doesn't exist (no need to load all parent IDs)
  const result = await prisma.$runCommandRaw({
    aggregate: rule.collection,
    pipeline: [
      {
        $lookup: {
          from: rule.parentCollection,
          localField: rule.fkField,
          foreignField: "_id",
          as: "_parent",
        },
      },
      { $match: { _parent: { $size: 0 } } },
      { $project: { _id: 1, [rule.fkField]: 1 } },
    ],
    cursor: {},
    comment: "validate-mongo-schema: find orphans",
  });
  const batch = result.cursor?.firstBatch ?? [];
  return batch.map((d) => ({
    id: String(d._id),
    fk: d[rule.fkField] != null ? String(d[rule.fkField]) : d[rule.fkField],
  }));
}

async function deleteOrphans(collection, ids) {
  if (ids.length === 0) return 0;
  const res = await prisma.$runCommandRaw({
    delete: collection,
    deletes: ids.map((id) => ({ q: { _id: new ObjectId(id) }, limit: 1 })),
    comment: "validate-mongo-schema: delete orphans",
  });
  return res.n ?? 0;
}

async function validateRequiredFields() {
  // Check critical models for missing required fields (MongoDB: $exists false or null)
  const checks = [
    {
      collection: "users",
      required: ["clerkId", "username", "firstName", "lastName", "createdAt", "updatedAt"],
    },
  ];

  const issues = [];
  for (const { collection, required } of checks) {
    for (const field of required) {
      const result = await prisma.$runCommandRaw({
        find: collection,
        filter: { $or: [{ [field]: { $exists: false } }, { [field]: null }] },
        limit: 100,
        projection: { _id: 1, [field]: 1 },
      });
      const batch = result.cursor?.firstBatch ?? [];
      for (const doc of batch) {
        issues.push({ collection, id: String(doc._id), missing: [field] });
      }
    }
  }
  return issues;
}

async function main() {
  console.log("MongoDB Schema Validation");
  console.log("Args:", ARGS);
  console.log("");

  // 1. Validate required fields
  const requiredIssues = await validateRequiredFields();
  if (requiredIssues.length > 0) {
    console.log("Missing required fields:");
    requiredIssues.slice(0, 20).forEach((i) => {
      console.log(`  ${i.collection} ${i.id}: missing ${i.missing.join(", ")}`);
    });
    if (requiredIssues.length > 20) {
      console.log(`  ... and ${requiredIssues.length - 20} more`);
    }
  } else {
    console.log("Required fields OK (sampled)");
  }

  // 2. Orphan detection and optional removal
  let totalOrphans = 0;
  for (const rule of ORPHAN_RULES) {
    const orphans = await findOrphans(rule);
    if (orphans.length > 0) {
      totalOrphans += orphans.length;
      console.log(
        `\nOrphans in ${rule.collection} (invalid ${rule.fkField} -> ${rule.parentCollection}): ${orphans.length}`
      );
      orphans.slice(0, 5).forEach((o) => console.log(`  - ${o.id} (fk: ${o.fk})`));
      if (orphans.length > 5) console.log(`  ... and ${orphans.length - 5} more`);

      if (ARGS.removeOrphans && ARGS.fix) {
        const deleted = await deleteOrphans(
          rule.collection,
          orphans.map((o) => o.id)
        );
        console.log(`  Deleted ${deleted} orphan(s)`);
      }
    }
  }

  if (totalOrphans === 0) {
    console.log("\nNo orphaned records found");
  } else if (!ARGS.fix || !ARGS.removeOrphans) {
    console.log(
      `\nTotal orphans: ${totalOrphans}. Run with --fix --remove-orphans to delete them.`
    );
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
