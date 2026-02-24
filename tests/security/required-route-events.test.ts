import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

type RouteCoverageCase = {
  file: string;
  requiredSnippets: string[];
};

const COVERAGE_CASES: RouteCoverageCase[] = [
  {
    file: "apps/lms/app/api/users/route.ts",
    requiredSnippets: ["SECURITY_EVENT_TYPES.USER_CREATED", "createdUserId"],
  },
  {
    file: "apps/lms/app/api/users/[userId]/route.ts",
    requiredSnippets: [
      "SECURITY_EVENT_TYPES.USER_REPORTS_TO_CHANGED",
      "SECURITY_EVENT_TYPES.USER_UPDATED",
      "SECURITY_EVENT_TYPES.USER_DELETED",
      "previousReportsToUserId",
      "newReportsToUserId",
      "updatedFields",
      "deletedUserId",
    ],
  },
  {
    file: "apps/lms/app/api/tenant/roles/route.ts",
    requiredSnippets: [
      "SECURITY_EVENT_TYPES.RBAC_ROLE_CREATED",
      "SECURITY_EVENT_TYPES.RBAC_ROLE_TEMPLATE_INITIALIZED",
      "roleAlias",
      "createdRoleCount",
    ],
  },
  {
    file: "apps/lms/app/api/tenant/roles/[roleId]/route.ts",
    requiredSnippets: [
      "SECURITY_EVENT_TYPES.RBAC_ROLE_UPDATED",
      "SECURITY_EVENT_TYPES.RBAC_ROLE_DELETED",
      "updatedFields",
      "roleAlias",
    ],
  },
  {
    file: "apps/lms/app/api/tenant/user-roles/route.ts",
    requiredSnippets: [
      "SECURITY_EVENT_TYPES.RBAC_ROLE_ASSIGNED",
      "SECURITY_EVENT_TYPES.RBAC_ROLE_UNASSIGNED",
      "targetUserId",
      "tenantRoleId",
    ],
  },
  {
    file: "apps/lms/app/api/user/rewards/redeem/route.ts",
    requiredSnippets: ["rewardRedeemed(", "pointsSpent", "rewardId"],
  },
  {
    file: "apps/lms/app/api/user/points/add/route.ts",
    requiredSnippets: ["pointsAwarded(", "awardedAmount", "requestedAmount"],
  },
  {
    file: "apps/lms/app/api/user/points/spend/route.ts",
    requiredSnippets: ["pointsDeducted(", "amount", "reason"],
  },
  {
    file: "apps/lms/app/api/admin/settings/route.ts",
    requiredSnippets: ["settingUpdated(", "key", "severity: \"high\""],
  },
  {
    file: "apps/lms/app/api/webhooks/route.ts",
    requiredSnippets: [
      "SECURITY_EVENT_TYPES.WEBHOOK_VERIFICATION_FAILED",
      "SECURITY_EVENT_TYPES.AUTH_SESSION_CREATED",
      "SECURITY_EVENT_TYPES.WEBHOOK_PROCESSING_FAILED",
    ],
  },
];

test("critical LMS routes include required security event instrumentation", () => {
  for (const coverageCase of COVERAGE_CASES) {
    const absolutePath = path.join(repoRoot, coverageCase.file);
    const fileContent = readFileSync(absolutePath, "utf8");

    for (const snippet of coverageCase.requiredSnippets) {
      assert.equal(
        fileContent.includes(snippet),
        true,
        `Missing required snippet "${snippet}" in ${coverageCase.file}`
      );
    }
  }
});
