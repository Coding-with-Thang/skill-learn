/**
 * Seed flash card permissions into the Permission table.
 * Run: node packages/database/scripts/seed-flashcard-permissions.js
 * Or:  npm run seed:flashcard-permissions (from repo root)
 *
 * Permissions: flashcards.create, flashcards.read, flashcards.update,
 * flashcards.delete, flashcards.manage_tenant, flashcards.manage_global
 */
const { config } = require("dotenv");
const { resolve } = require("path");
const { PrismaClient } = require("@prisma/client");

const rootDir = resolve(__dirname, "../../..");
for (const name of [".env.local", ".env"]) {
  config({ path: resolve(rootDir, name) });
}

const FLASHCARD_PERMISSIONS = [
  {
    name: "flashcards.create",
    displayName: "Create Flash Cards",
    description: "Create personal flash cards and categories",
    category: "flashcards",
  },
  {
    name: "flashcards.read",
    displayName: "Read Flash Cards",
    description: "View and study flash cards",
    category: "flashcards",
  },
  {
    name: "flashcards.update",
    displayName: "Update Flash Cards",
    description: "Edit own flash cards and categories",
    category: "flashcards",
  },
  {
    name: "flashcards.delete",
    displayName: "Delete Flash Cards",
    description: "Delete own flash cards and categories",
    category: "flashcards",
  },
  {
    name: "flashcards.manage_tenant",
    displayName: "Manage Tenant Flash Cards",
    description: "Admin: manage all flash cards in the tenant",
    category: "flashcards",
  },
  {
    name: "flashcards.manage_global",
    displayName: "Manage Global Flash Cards",
    description: "Super admin: manage platform-wide flash cards",
    category: "flashcards",
  },
];

async function main(prisma) {
  let created = 0;

  for (const p of FLASHCARD_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: p.name },
    });
    if (existing) {
      console.log(`Permission ${p.name} already exists`);
      continue;
    }
    await prisma.permission.create({
      data: {
        name: p.name,
        displayName: p.displayName,
        description: p.description,
        category: p.category,
        isActive: true,
      },
    });
    console.log(`Created permission: ${p.name}`);
    created++;
  }

  console.log(`\nDone. Created ${created} new permission(s).`);
}

let prisma;

async function run() {
  prisma = new PrismaClient();
  await main(prisma);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
