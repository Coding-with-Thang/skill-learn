/**
 * LMS Zod schemas: re-export shared schemas from @skill-learn/lib and define
 * LMS-only schemas (flashcards, user form overrides for reportsToUserId).
 */
import { z } from "zod";
import {
  objectIdSchema,
  courseStatus,
  courseStatusOptions,
  courseSchema,
  courseUpdateSchema,
  addPointsSchema,
  spendPointsSchema,
  quizCreateSchema,
  quizUpdateSchema,
  quizFinishSchema,
  userCreateSchemaBase as libUserCreateSchemaBase,
  userUpdateSchemaBase as libUserUpdateSchemaBase,
  rewardRedeemSchema,
  rewardCreateSchema,
  rewardUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  settingUpdateSchema,
  settingsFormSchema,
  pathParamSchema,
  fileUploadSchema,
} from "@skill-learn/lib/zodSchemas.js";

// Re-export all shared schemas from the package
export {
  objectIdSchema,
  courseStatus,
  courseStatusOptions,
  courseSchema,
  courseUpdateSchema,
  addPointsSchema,
  spendPointsSchema,
  quizCreateSchema,
  quizUpdateSchema,
  quizFinishSchema,
  rewardRedeemSchema,
  rewardCreateSchema,
  rewardUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  settingUpdateSchema,
  settingsFormSchema,
  pathParamSchema,
  fileUploadSchema,
};

// LMS form override: reportsToUserId accepts empty string from select and transforms to null
export const userCreateSchema = libUserCreateSchemaBase.extend({
  reportsToUserId: z
    .union([objectIdSchema, z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const userUpdateSchema = libUserUpdateSchemaBase.extend({
  reportsToUserId: z
    .union([objectIdSchema, z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
}).refine(
  (data) => {
    const p = data.password?.trim?.() ?? data.password ?? "";
    if (p.length === 0) return true;
    return data.confirmPassword === data.password;
  },
  { message: "Passwords do not match", path: ["confirmPassword"] }
);

// ============== Flash Card schemas (LMS-only) ==============

export const flashCardDifficultySchema = z.enum(["easy", "good", "hard"]).nullable();

export const flashCardStudySessionSchema = z.object({
  deckId: objectIdSchema.optional(),
  deckIds: z.array(objectIdSchema).optional(),
  categoryIds: z.array(objectIdSchema).optional(),
  virtualDeck: z.enum(["due_today", "needs_attention", "company_focus"]).optional(),
  difficulties: z.array(z.enum(["easy", "good", "hard"])).optional(),
  limit: z.number().int().min(1).max(200).optional().default(25),
});

export const flashCardProgressSchema = z.object({
  flashCardId: objectIdSchema,
  feedback: z.enum(["needs_review", "got_it", "mastered"]),
});

export const flashCardCreateSchema = z.object({
  question: z.string().min(1, "Question is required").max(2000),
  answer: z.string().min(1, "Answer is required").max(5000),
  categoryId: objectIdSchema,
  tags: z.array(z.string().max(50)).optional().default([]),
  difficulty: z.enum(["easy", "good", "hard"]).nullable().optional(),
  isPublic: z.boolean().optional().default(false),
});

export const flashCardUpdateSchema = flashCardCreateSchema.partial().extend({
  categoryId: objectIdSchema.optional(),
  isGlobal: z.boolean().optional(),
});

export const flashCardCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isSystem: z.boolean().optional(),
});

const flashCardBulkCardSchema = z.object({
  question: z.string().min(1).max(2000),
  answer: z.string().min(1).max(5000),
  tags: z.array(z.string().max(50)).optional().default([]),
  difficulty: z.enum(["easy", "good", "hard"]).nullable().optional(),
});

export const flashCardBulkImportSchema = z.object({
  categoryId: objectIdSchema,
  cards: z.array(flashCardBulkCardSchema),
});

export const flashCardUserBulkCreateSchema = z.object({
  categoryId: objectIdSchema,
  cards: z.array(flashCardBulkCardSchema).min(1, "At least one card is required"),
});

export const flashCardCategoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  isSystem: z.boolean().optional().default(false),
});

export const flashCardDeckCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  cardIds: z.array(objectIdSchema).optional().default([]),
  hiddenCardIds: z.array(objectIdSchema).optional().default([]),
  categoryIds: z.array(objectIdSchema).optional().default([]),
  isPublic: z.boolean().optional().default(false),
});

export const flashCardDeckUpdateSchema = flashCardDeckCreateSchema.partial();

export const deckIdParamSchema = pathParamSchema("deckId");

export const flashCardDeckHideSchema = z.object({
  cardId: objectIdSchema,
  hidden: z.boolean(),
});

export const flashCardAcceptSchema = z.object({
  flashCardId: objectIdSchema,
});

export const flashCardDeckAcceptSchema = z.object({
  deckId: objectIdSchema,
});

export const flashCardDeckShareSchema = z.object({
  deckIds: z.array(objectIdSchema).min(1, "Select at least one deck"),
  recipientUserIds: z.union([
    z.literal("all"),
    z.array(objectIdSchema).min(1, "Select at least one recipient"),
  ]),
});

export const categoryPriorityAdminSchema = z.object({
  categoryId: objectIdSchema,
  priority: z.number().int().min(1).max(10),
});

export const categoryPriorityUserSchema = z.object({
  categoryId: objectIdSchema,
  priority: z.number().int().min(1).max(10),
});

export const flashCardPrioritySettingsSchema = z.object({
  overrideMode: z.enum([
    "USER_OVERRIDES_ADMIN",
    "ADMIN_OVERRIDES_USER",
    "ADMIN_ONLY",
    "USER_ONLY",
  ]),
});
