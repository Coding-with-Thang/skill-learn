/**
 * Run prisma db push with env loaded from monorepo root.
 * Run from repo root: npm run db:push
 */
const { config } = require("dotenv");
const { resolve } = require("path");
const { execSync } = require("child_process");

const rootDir = resolve(__dirname, "../../..");
const schemaPath = resolve(__dirname, "../prisma/schema.prisma");

// Load .env from root (prefer .env.local)
for (const name of [".env.local", ".env"]) {
  const loaded = config({ path: resolve(rootDir, name) });
  if (loaded.parsed && Object.keys(loaded.parsed).length > 0) {
    console.log("Loaded env from", name);
    break;
  }
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not found. Ensure .env or .env.local exists in the project root.");
  process.exit(1);
}

execSync(`npx prisma db push --schema="${schemaPath}"`, {
  stdio: "inherit",
  cwd: resolve(__dirname, ".."),
});
