# Reporting Hierarchy / "Reports To" – Implementation Options

**Status:** Option 3 (self-referential field + AuditLog) is **implemented**.

## Requirement

- **Per-tenant**: User A reports to User B, User B reports to User C, defined within a tenant.
- **Optional**: Hierarchy does not need to be fully defined (some users may have no "reports to").
- **Permission**: Tenant admin (and other users with the right role/permission) can assign who reports to whom.

---

## Design Constraints

- Users belong to **one tenant** (`User.tenantId`).
- Authorization is **tenant RBAC** (TenantRole + UserRole + Permission).
- "Reports to" must be **scoped to the same tenant** (user and manager in same tenant).
- Avoid **circular references** (e.g. A → B → A) and **self-reference** (user cannot report to themselves).

---

## Option 1: Self-Referential Field on User (Recommended)

Add a single optional field on `User` that points to another user in the same tenant.

### Schema

```prisma
model User {
  // ... existing fields
  tenantId        String?   @db.ObjectId
  reportsToUserId String?   @db.ObjectId  // Same tenant; null = no manager
  reportsTo       User?     @relation("UserReportsTo", fields: [reportsToUserId], references: [id], onDelete: SetNull)
  directReports   User[]    @relation("UserReportsTo")
  // ...
  @@index([tenantId, reportsToUserId])
}
```

### Pros

- **Simple**: One field, no new table; easy to understand and query.
- **Fast reads**: "Who does X report to?" and "List direct reports of Y" are one lookup or filtered query.
- **Fits current model**: User already has `tenantId`; "reports to" is a natural attribute of the user within that tenant.
- **Standard pattern**: Self-referential FK is the usual approach for single-manager hierarchies (see e.g. [Stack Overflow](https://stackoverflow.com/questions/35564081/how-can-i-best-represent-users-and-the-managers-they-report-to-within-a-relation)); use `null` for top-level users.

### Cons

- No built-in **audit trail** (who assigned, when). Can be added later via:
  - Existing `AuditLog` (log "user X reports to Y" on change), or
  - Optional small `UserReportingHistory` table if you need full history.

### API / Permission

- **Reuse `users.update`**: Allow setting `reportsToUserId` in `PUT /api/users/[userId]` when the caller has `users.update` (or equivalent) in that tenant.
- **Validation in API**:
  - `reportsToUserId` must be a user in the **same tenant**.
  - Reject **self-reference** (`reportsToUserId !== userId`).
  - Optional: reject **cycles** (e.g. before setting A → B, check that B does not already report to A, directly or indirectly).

### Effort

- **Low**: Schema change, Prisma generate, update users GET/PUT (include/validate `reportsToUserId`), UI (e.g. "Reports to" dropdown in user form and user list column).

---

## Option 2: Dedicated Tenant-Scoped Reporting Table

Model "reports to" as an explicit relationship with audit fields.

### Schema

```prisma
model UserReporting {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  tenantId        String   @db.ObjectId
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId          String   @db.ObjectId   // The user who reports to someone
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  reportsToUserId String   @db.ObjectId   // The manager
  reportsTo       User     @relation("DirectReports", fields: [reportsToUserId], references: [id], onDelete: Cascade)
  assignedBy      String?  // Clerk user ID
  assignedAt      DateTime @default(now())
  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([tenantId, reportsToUserId])
  @@map("user_reporting")
}
```

(Add inverse relations on `User` and `Tenant` as needed.)

### Pros

- **Audit from day one**: `assignedBy`, `assignedAt` without touching `User`.
- **Clear tenant scope**: `tenantId` on the relationship; easy to add `effectiveFrom` / `effectiveTo` later for history.
- **Separation of concerns**: Reporting is a first-class concept, not an attribute of User.

### Cons

- **Extra table and join**: Every "reports to" read (e.g. user profile, user list) needs a join or a second query.
- **Slightly more code**: CRUD and validation for `UserReporting` in addition to User.

### API / Permission

- **New or existing permission**: Either add `users.assign_reports_to` (finer-grained) or reuse `users.update`.
- **Endpoints**:  
  - **Option A**: Keep a single user API: in `PUT /api/users/[userId]`, accept `reportsToUserId` and upsert/delete `UserReporting` for that user in the tenant.  
  - **Option B**: Add dedicated `PATCH /api/tenant/users/[userId]/reporting` that only updates the reporting relationship (requires permission).

### Effort

- **Medium**: New model, migration, API logic, and UI; similar validation rules (same tenant, no self, optional cycle check).

---

## Option 3: Hybrid – Field on User + Audit via AuditLog

Same as Option 1 (self-referential `reportsToUserId` on User), plus:

- On every change to "reports to", write an entry to the existing **AuditLog** (e.g. action `"user.reports_to_changed"`, resource `"user"`, resourceId = userId, details = `{ previousReportsToUserId, newReportsToUserId }`).

### Pros

- Simple data model (Option 1) with **who/when** traceability using current infrastructure.
- No new tables; consistent with how you already log other actions.

### Cons

- Audit is "log style" (query by user/action), not a dedicated reporting-history table. Fine for "who set this and when?"; less ideal for "full history of reporting changes" UIs without some query design.

### Effort

- **Low–medium**: Same as Option 1 plus one audit log call in the update path.

---

## Permission Strategy

| Approach | When to use |
|--------|--------------|
| **Reuse `users.update`** | Simplest; anyone who can edit the user can set "reports to". Good default. |
| **New permission `users.assign_reports_to`** | When you want to allow "edit user profile" but restrict "change reporting" to managers/admins. Requires adding the permission and assigning it to the right TenantRoles. |

Recommendation: **Start with `users.update`**; introduce `users.assign_reports_to` only if you get a concrete need to separate these capabilities.

---

## Validation Rules (All Options)

1. **Same tenant**: `reportsToUserId` must belong to a user with the same `tenantId` as the user being updated.
2. **No self-reference**: `reportsToUserId !== userId`.
3. **Optional – no cycles**: Before setting A → B, ensure B is not in A’s current "reports to" chain (e.g. B ≠ A and B does not report to A, directly or indirectly). Can be implemented with a small recursive/iterative check or a materialized path if you need to scale.

---

## Recommendation

- **Preferred: Option 1 (self-referential on User)**  
  - Easiest to implement and maintain, and matches the requirement (single "reports to" per user per tenant).  
  - Add **Option 3** (audit via AuditLog) if you want "who assigned / when" without a new table.

- **Choose Option 2** if you need **full reporting history** (e.g. "who reported to whom at date X") or multiple effective dates from the start; otherwise you can add a dedicated history table later and still keep Option 1 for the current state.

---

## Summary Table

| Criteria              | Option 1 (User field) | Option 2 (Table)   | Option 3 (User + Audit) |
|-----------------------|------------------------|---------------------|---------------------------|
| Complexity            | Low                    | Medium              | Low                       |
| Query simplicity      | High                   | Medium (joins)      | High                      |
| Audit (who/when)      | No*                    | Yes                 | Yes (via AuditLog)        |
| Full history          | No                     | Yes (if extended)   | Query-only (AuditLog)     |
| New tables            | No                     | Yes                 | No                        |
| Fits tenant model     | Yes                    | Yes                 | Yes                       |

\* Unless you add AuditLog (Option 3) or a separate history mechanism.
