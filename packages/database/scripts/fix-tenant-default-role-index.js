/**
 * Fix MongoDB unique index conflicts on tenants nullable fields
 *
 * Multiple tenants have null for defaultRoleId, stripeCustomerId, stripeSubscriptionId.
 * Standard unique indexes treat null as a value—allowing only one. This script
 * replaces them with sparse unique indexes, which exclude nulls and allow multiple.
 *
 * Run: node packages/database/scripts/fix-tenant-default-role-index.js
 * Or:  npm run fix:tenant-index (from repo root)
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const FIXES = [
  {
    field: "defaultRoleId",
    indexNames: ["tenants_defaultRoleId_key", "defaultRoleId_1"],
    newName: "tenants_defaultRoleId_key",
  },
  {
    field: "stripeCustomerId",
    indexNames: ["tenants_stripeCustomerId_key", "stripeCustomerId_1"],
    newName: "tenants_stripeCustomerId_key",
  },
  {
    field: "stripeSubscriptionId",
    indexNames: ["tenants_stripeSubscriptionId_key", "stripeSubscriptionId_1"],
    newName: "tenants_stripeSubscriptionId_key",
  },
];

async function dropIndex(prisma, name) {
  try {
    await prisma.$runCommandRaw({
      dropIndexes: "tenants",
      index: name,
    });
    return true;
  } catch (err) {
    const msg = err.meta?.message ?? err.message ?? "";
    const isNotFound = err.code === "P2010" || err.code === 27 || msg.includes("IndexNotFound") || msg.includes("index not found");
    return isNotFound ? false : null;
  }
}

async function main() {
  const prisma = new PrismaClient();

  for (const { field, indexNames, newName } of FIXES) {
    console.log(`\n--- Fixing ${field} ---`);
    let dropped = false;
    for (const name of indexNames) {
      console.log("Dropping existing index:", name);
      const result = await dropIndex(prisma, name);
      if (result === true) {
        console.log("Index dropped.");
        dropped = true;
        break;
      }
      if (result === null) throw new Error(`Failed to drop index: ${name}`);
    }

    console.log("Creating sparse unique index...");
    await prisma.$runCommandRaw({
      createIndexes: "tenants",
      indexes: [
        {
          key: { [field]: 1 },
          name: newName,
          unique: true,
          sparse: true,
        },
      ],
    });
    console.log(`Sparse unique index on ${field} created.`);
  }

  console.log("\nAll tenant indexes fixed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
