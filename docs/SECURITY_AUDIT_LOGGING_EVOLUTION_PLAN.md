# Security Audit Logging and Abuse Defense Evolution Plan

This document defines how Skill-Learn should evolve audit logging and event records to better monitor, detect, prevent, and stop abuse and malicious activities using industry best practices.

---

## 1) Scope and objectives

### Primary objectives

1. Increase security visibility for tenant and platform activity.
2. Detect abuse quickly with high-confidence rules.
3. Prevent abuse through adaptive controls and automated response.
4. Preserve reliable forensic records for investigations and compliance.

### In-scope systems

- LMS application (Phase 1 and Phase 2)
- CMS application (post-LMS hardening phase)
- API routes and webhook handlers
- Multi-tenant RBAC changes
- Authentication/session events
- Rewards/points and other abuse-prone business workflows

### Success criteria (target state)

- 100% coverage of high-risk actions with structured audit events.
- Mean Time To Detect (MTTD) for critical abuse patterns under 5 minutes.
- Mean Time To Respond (MTTR) for critical abuse patterns under 15 minutes.
- 0 secrets logged in audit payloads (validated by automated tests and redaction checks).
- Tamper-evident audit records for critical security events.

### Execution mode (updated)

- No slow rollout is required because there are currently no active users.
- Delivery remains phased for engineering control and risk management.
- Each phase uses a direct cutover approach after validation (no canary/percentage rollout).
- Phase 1 is strictly LMS tenant-level scope.

---

## 2) Current-state baseline (repository-specific)

Based on current implementation:

- `packages/lib/utils/auditLogger.ts`
  - Uses free-form `action/resource/details` strings.
  - Minimal event context (no IP, user-agent, request ID, outcome, severity).
  - Logging failures are swallowed (console only), no durable fallback path.
- `packages/database/prisma/schema.prisma` (`AuditLog`)
  - Basic schema: `userId/action/details/resource/resourceId/timestamp`.
  - No explicit tenant field, event category, integrity metadata, or risk level.
- `apps/lms/app/api/admin/audit-logs/route.ts`
  - Read path is admin-only and filterable, but limited to basic fields.
  - Write path accepts generic payload; no strong event contract validation.
- `apps/lms/app/(lms)/(admin)/dashboard/audit-logs/page.tsx`
  - Useful visibility for admin activity, but no severity, outcome, risk, or incident states.

### Key gaps to close

1. Inconsistent event shape and taxonomy.
2. Missing request and security context needed for detection.
3. No integrity/tamper-evidence guarantees for critical logs.
4. No detection pipeline tied to abuse playbooks and automated controls.
5. No formal retention policy by event criticality.

---

## 3) Target architecture

### 3.1 Logical flow

1. **Event producers** (API routes, auth/webhooks, admin actions, sensitive business flows)
2. **Central logging SDK** in shared lib (single typed event contract)
3. **Durable ingestion path**
   - Fast write to primary event store
   - Retry queue / dead-letter path for failed writes
4. **Detection pipeline**
   - Rule-based detections for high-confidence abuse
   - SIEM integration for correlation and alerting
5. **Response engine**
   - Trigger controls (rate limit, lockout, step-up auth, session revoke)
   - Open incident and route to on-call
6. **Investigation surfaces**
   - Admin dashboards, export, and forensics workflows

### 3.2 Design principles

- Structured logs only (no unbounded free-form-only events).
- Immutable append-only model for critical security events.
- Least-privilege access to logs.
- Privacy by design (redaction, minimization, retention controls).
- Detection-first instrumentation for abuse-prone flows.

---

## 4) Security audit event standard (new contract)

Adopt a versioned schema, for example `securityEvent.v1`.

### Required fields

| Field | Description |
|---|---|
| `eventId` | Globally unique event identifier (ULID/UUIDv7). |
| `occurredAt` | When the action occurred. |
| `ingestedAt` | When event was persisted. |
| `eventType` | Canonical action name (`auth.login.failed`, `rbac.role.assigned`, etc.). |
| `category` | High-level class (`auth`, `rbac`, `data_access`, `billing`, `content`, `system`). |
| `severity` | `low`, `medium`, `high`, `critical`. |
| `outcome` | `success`, `failure`, `blocked`, `challenged`. |
| `tenantId` | Tenant context (nullable only for platform-level events). |
| `actor` | Who/what performed the action. |
| `target` | What object/resource was affected. |
| `requestContext` | Route/method/requestId/IP/user-agent metadata. |

### Recommended fields

| Field | Description |
|---|---|
| `riskScore` | Numeric risk score (0-100). |
| `reasonCodes` | Detection or policy reason labels. |
| `changeSummary` | Sanitized before/after metadata for update actions. |
| `correlationId` | Link related events in a request/session/incident. |
| `integrity` | Record hash and previous hash for tamper evidence. |
| `retentionClass` | Drives lifecycle policy (`standard`, `security_critical`, `legal_hold`). |

### Data handling rules

- Never log: passwords, tokens, secrets, private keys, session cookies, raw payment details.
- Redact PII where possible (or hash/pseudonymize when needed for correlation).
- Use allowlists for logged request/response fields.

---

## 5) Abuse-focused detection strategy

Implement a baseline rule set first, then add anomaly detection.

### High-priority detection rules

| Use case | Signal | Threshold | Initial response |
|---|---|---|---|
| Brute force login | `auth.login.failed` by IP/user | >=10 in 5 min | Temporary IP/user throttle, require step-up auth |
| Privilege escalation | `rbac.role.assigned` to admin-like role | Any unexpected grant | Alert security, require secondary approval |
| Cross-tenant access | authorization denied with tenant mismatch | >=3 attempts in 10 min | Block session, raise high severity alert |
| Reward/points fraud | unusual point grants/redemptions | tenant/user z-score + static guardrails | Hold redemption and require admin review |
| Mass data extraction | repeated export/list of sensitive records | rate and volume anomalies | Throttle/export lock and alert |
| Webhook abuse/tamper | repeated signature failures | >=5 in 10 min | Block source and alert operations |

### Detection pipeline outputs

- Alert severity classification.
- Incident ticket creation with context.
- Linked event timeline by `correlationId`.
- Auto-remediation actions where confidence is high.

---

## 6) Prevention and stop controls

Tie detections to policy controls:

1. **Adaptive rate limiting**
   - Per IP + user + tenant + endpoint.
2. **Step-up authentication**
   - Trigger MFA challenge for risky admin actions.
3. **Session and token controls**
   - Revoke active sessions on suspected compromise.
4. **Privilege guardrails**
   - Two-person approval for high-risk role/permission changes.
5. **Workflow circuit breakers**
   - Temporarily disable risky operations (for example reward redemption) on abuse spikes.
6. **Tenant isolation controls**
   - Quarantine tenant-level abusive behavior while preserving evidence.

---

## 7) Audit record integrity and retention

### Integrity controls

- Append-only writes for security-critical events.
- Hash chaining for critical logs:
  - `recordHash = HMAC(secret, canonicalEventJson)`
  - `prevHash` to link sequence blocks.
- Key rotation policy and verification tooling.
- Strict write/read access separation (AU-9 style control).

### Retention policy (initial recommendation)

| Class | Hot retention | Archive retention | Notes |
|---|---|---|---|
| Standard audit | 90 days | 1 year | Operational investigations |
| Security critical | 1 year | 7 years | Incident and legal defensibility |
| Legal hold | N/A | Until released | Override deletion pipeline |

Apply tenant-aware retention where contractual/regulatory obligations differ.

---

## 8) Standards and framework alignment

| Standard / framework | How this plan aligns |
|---|---|
| OWASP Logging Cheat Sheet | Structured event schema, sensitive data exclusion, consistency guidelines |
| NIST SP 800-53 (AU family) | Event content, retention, review, integrity, and access control |
| NIST Cybersecurity Framework 2.0 | Supports Govern/Protect/Detect/Respond functions |
| ISO/IEC 27001:2022 (A.8.15, A.5.28, A.5.24) | Logging, secure coding, and incident preparation/response |
| CIS Controls v8 (Controls 8 and 13) | Audit log management and network/system monitoring |
| PCI DSS v4 Req. 10 (if payment systems in scope) | Audit trails and monitoring for payment-related events |

---

## 9) Fast phased roadmap (LMS tenant-first)

### Phase 1 (Week 1): LMS tenant-level foundation and cutover

- Define `securityEvent.v1` schema and taxonomy.
- Introduce centralized logging SDK in shared package.
- Add redaction utilities and field allowlists.
- Implement LMS-only instrumentation (tenant-scoped):
  - auth success/failure
  - admin CRUD and RBAC changes
  - rewards/points sensitive actions
  - webhook verification failures
- Replace legacy LMS audit writes with direct structured event writes after validation.
- Cut over directly in LMS (no gradual rollout).

### Phase 2 (Week 2): LMS detection, visibility, and controls

- Add rule engine and alert routing for high-priority abuse cases.
- Expand LMS audit log API filters for severity/outcome/eventType/riskScore.
- Update LMS admin dashboard to show severity, outcome, and risk indicators.
- Add CSV/JSON export with redaction and access controls.
- Add runbooks for triage and response.
- Enable automated prevention actions for high-confidence detections.

### Phase 3 (Week 3+): Hardening and expansion

- Add incident timeline view with event correlation.
- Add integrity verification tooling and scheduled audits.
- Finalize retention and archive automation.
- Expand the same architecture to CMS after LMS is stable.

---

## 10) Repository implementation checklist

### 10.1 Schema and data model

- `packages/database/prisma/schema.prisma`
  - Add `SecurityAuditEvent` model (versioned schema fields).
  - Add indexes for `tenantId`, `eventType`, `severity`, `outcome`, `occurredAt`, `riskScore`.
  - Add optional `AuditAlert` model for detection outputs.

### 10.2 Logging library and event SDK

- `packages/lib/utils/auditLogger.ts`
  - Refactor into typed structured logger.
  - Preserve compatibility wrappers for existing callers.
- New files under `packages/lib/utils/security/`:
  - `eventTypes.ts`, `schema.ts`, `logger.ts`, `redaction.ts`, `integrity.ts`.

### 10.3 API instrumentation

- Phase 1 boundary: instrument LMS high-risk routes first (tenant scope only):
  - auth-related handlers
  - admin management routes
  - points/rewards routes
  - webhook route (`apps/lms/app/api/webhooks/route.ts`)
- `apps/lms/app/api/admin/audit-logs/route.ts`
  - Add advanced filters (`eventType`, `severity`, `outcome`, `riskScore`).
  - Enforce strict validation for event ingestion payloads.
- Defer `apps/cms/**` instrumentation until Phase 3 expansion.

### 10.4 UI and operational visibility

- `apps/lms/app/(lms)/(admin)/dashboard/audit-logs/page.tsx`
  - Add severity badges, outcome labels, and risk indicators.
  - Add incident drill-down and correlation view.
- `packages/lib/stores/store/auditLogStore.ts` and `packages/lib/hooks/useAuditLog.ts`
  - Add strong typing and filter expansion.

### 10.5 Testing and quality gates

- Unit tests:
  - schema validation
  - redaction
  - integrity hash generation
- Integration tests:
  - critical route emits required security events
  - alert rule triggers expected response
- Regression guard:
  - CI check fails if required event fields are missing for high-risk actions.

---

## 11) Governance and operating model

- Assign owners:
  - Security architecture owner
  - Platform/backend owner
  - Detection/on-call owner
- Create monthly control review:
  - rule effectiveness
  - false positives/negatives
  - retention and access audits
- Maintain incident playbooks for:
  - account takeover
  - privilege misuse
  - fraud/abuse spikes
  - data exfiltration suspicion

---

## 12) Immediate next sprint (recommended)

1. Approve event taxonomy and `securityEvent.v1` contract.
2. Implement structured logger with redaction utilities.
3. Instrument top LMS tenant-level high-risk routes.
4. Cut over LMS audit writes directly to structured events.
5. Ship first 6 abuse detection rules with alert routing.
6. Update LMS admin audit log page for severity and outcome fields.

---

## 13) Metrics to report weekly

- Security event ingestion success rate.
- Coverage of high-risk actions emitting structured events.
- MTTD and MTTR by severity.
- Alert precision (true positive rate) and analyst load.
- Count of prevented attacks (blocked/challenged outcomes).
- Integrity verification pass rate for critical logs.

---

This plan is designed for fast phased delivery, starting with LMS tenant-level implementation and direct cutover.
