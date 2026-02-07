# MongoDB Schema Validation & Data Cleanup

> **Note:** The `db:validate` script was removed to keep only Vercel-essential scripts. Use manual validation (Option B or C below) or restore the script from git history if needed.

Prisma with MongoDB does **not** enforce schema at the database level. Unlike SQL databases, MongoDB does not validate documents against your Prisma schema. This doc explains how to validate, update, and clean data.

## What Prisma Provides

| Command | What it does with MongoDB |
|---------|---------------------------|
| `prisma db push` | Syncs **indexes** defined in your schema. Does **not** validate existing documents or remove orphaned data. |
| `prisma generate` | Regenerates the Prisma Client for type-safe queries. |

**Important**: Prisma docs state: *"MongoDB will not enforce the schema, so you have to verify data integrity."*

## 1. Validation Strategy

### Option A: Validation script (removed)

A validation script was previously available at `packages/database/scripts/validate-mongo-schema.js`. It:

- **Validates** required fields exist and types are correct
- **Detects orphans**: records whose parent IDs no longer exist (e.g., PointLog for deleted User)
- **Reports** missing fields, invalid ObjectIds, enum mismatches

Restore from git history if needed.

### Option B: Manual validation via Prisma Client

Query collections and catch errors. Prisma throws at read time if a document shape is incompatible:

```js
// Will throw if documents have wrong types for Prisma to deserialize
const users = await prisma.user.findMany();
```

This only catches severe type mismatches, not missing optional fields or orphaned references.

### Option C: MongoDB schema validation (Atlas / MongoDB 3.6+)

You can add [JSON Schema validation](https://www.mongodb.com/docs/manual/core/schema-validation/) at the collection level. This is separate from Prisma; you’d define rules in MongoDB and keep them in sync with your schema manually.

## 2. Removing Orphaned Records

Orphaned records reference non-existent parents (e.g., `PointLog` with `userId` pointing to a deleted `User`).

The validation script can:

1. **Report** orphans (default / `--dry-run`)
2. **Delete** orphans with `--fix --remove-orphans`

Parent→child relationships from your schema used for orphan detection:

| Child collection | Parent | FK field |
|------------------|--------|----------|
| point_logs | users | userId |
| category_stats | users, categories | userId, categoryId |
| reward_logs | users, rewards | userId, rewardId |
| audit_logs | users | userId |
| flash_card_progress | users, flash_cards | userId, flashCardId |
| course_chapters | courses | courseId |
| questions | quizzes | quizId |
| options | questions | questionId |
| ... | ... | ... |

## 3. Updating Records for Schema Changes

When you add required fields or change types, use custom scripts.

### Add required field with default

```js
// Example: Add phoneNumber with default to all Users
await prisma.$runCommandRaw({
  update: "users",
  updates: [{
    q: { phoneNumber: { $exists: false } },
    u: { $set: { phoneNumber: "000-000-0000" } },
    multi: true,
  }],
});
```

### Add optional field (no migration needed)

Optional fields (`String?`, `Int?`) work without updates. Prisma returns `null` for missing fields.

### Rename field

1. Add new field
2. Copy data: `db.collection.updateMany({}, { $set: { newField: "$oldField" } })`
3. Update app to use new field
4. Remove old field via another script

## 4. Recommended Workflow

1. **Before schema changes**  
   Use manual validation (Option B or C) to establish a baseline.

2. **After schema changes**  
   - Run `npx prisma db push` to sync indexes  
   - Write and run data migration scripts for new required fields or renames

3. **Periodic maintenance**  
   Use manual validation or restore the validation script from git history.

## 5. Data Migration Strategies (from Prisma docs)

- **On-demand**: Add optional fields; update records when users interact.
- **No breaking changes**: Only add optional fields; avoid renames/deletes.
- **All-at-once**: Use a script to update all existing documents before deploying schema changes.
