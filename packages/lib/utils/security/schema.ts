import { z } from "zod";

export const SECURITY_EVENT_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const SECURITY_EVENT_OUTCOMES = [
  "success",
  "failure",
  "blocked",
  "challenged",
] as const;

export const SECURITY_RETENTION_CLASSES = [
  "standard",
  "security_critical",
  "legal_hold",
] as const;

export const securityEventSeveritySchema = z.enum(SECURITY_EVENT_SEVERITIES);
export const securityEventOutcomeSchema = z.enum(SECURITY_EVENT_OUTCOMES);
export const securityRetentionClassSchema = z.enum(SECURITY_RETENTION_CLASSES);

export const securityRequestContextSchema = z
  .object({
    ipAddress: z.string().max(128).optional(),
    userAgent: z.string().max(1024).optional(),
    requestId: z.string().max(256).optional(),
    route: z.string().max(1024).optional(),
    httpMethod: z.string().max(16).optional(),
    correlationId: z.string().max(256).optional(),
    sessionId: z.string().max(256).optional(),
  })
  .optional();

export const securityAuditEventInputSchema = z.object({
  eventType: z.string().min(2).max(256),
  category: z.string().min(2).max(128),
  action: z.string().min(2).max(64),
  resource: z.string().max(128).optional(),
  resourceId: z.string().max(256).nullable().optional(),
  actorUserId: z.string().max(256).optional(),
  actorClerkId: z.string().max(256).optional(),
  actorType: z.enum(["user", "system", "service", "anonymous"]).optional(),
  actorDisplayName: z.string().max(256).optional(),
  tenantId: z.string().max(256).nullable().optional(),
  severity: securityEventSeveritySchema.optional(),
  outcome: securityEventOutcomeSchema.optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
  reasonCodes: z.array(z.string().min(1).max(128)).optional(),
  message: z.string().max(4000).optional(),
  details: z.unknown().optional(),
  requestContext: securityRequestContextSchema,
  retentionClass: securityRetentionClassSchema.optional(),
  occurredAt: z.date().optional(),
  throwOnError: z.boolean().optional(),
});

export type SecurityRequestContext = z.infer<typeof securityRequestContextSchema>;
export type SecurityAuditEventInput = z.infer<typeof securityAuditEventInputSchema>;
export type SecurityEventSeverity = z.infer<typeof securityEventSeveritySchema>;
export type SecurityEventOutcome = z.infer<typeof securityEventOutcomeSchema>;
