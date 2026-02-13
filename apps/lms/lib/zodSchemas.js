/**
 * LMS Zod schemas: re-export shared schemas from @skill-learn/lib and define
 * LMS-only schemas (flashcards, user form overrides for reportsToUserId).
 */
import { z } from "zod";
import * as libSchemas from "@skill-learn/lib/zodSchemas.js";

// Re-export everything from package; we override specific schemas below
export const objectIdSchema = libSchemas.objectIdSchema;
export const addPointsSchema = libSchemas.addPointsSchema;
export const spendPointsSchema = libSchemas.spendPointsSchema;
export const quizCreateSchema = libSchemas.quizCreateSchema;
export const quizUpdateSchema = libSchemas.quizUpdateSchema;
export const quizFinishSchema = libSchemas.quizFinishSchema;
export const rewardRedeemSchema = libSchemas.rewardRedeemSchema;
export const rewardCreateSchema = libSchemas.rewardCreateSchema;
export const rewardUpdateSchema = libSchemas.rewardUpdateSchema;
export const categoryCreateSchema = libSchemas.categoryCreateSchema;
export const categoryUpdateSchema = libSchemas.categoryUpdateSchema;
export const settingUpdateSchema = libSchemas.settingUpdateSchema;
export const settingsFormSchema = libSchemas.settingsFormSchema;
export const pathParamSchema = libSchemas.pathParamSchema;
export const fileUploadSchema = libSchemas.fileUploadSchema;

// LMS form override: reportsToUserId accepts empty string from select and transforms to null
export const userCreateSchema = libSchemas.userCreateSchemaBase.extend({
  reportsToUserId: z
    .union([objectIdSchema, z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

// Common schemas (LMS overrides; objectIdSchema comes from package re-export above)
export const courseStatus = z.enum(["Draft", "Published", "Achieved"]);

// Array of course status values for UI components
export const courseStatusOptions = ["Draft", "Published", "Achieved"];

// Slug: lowercase, letters, numbers, hyphens only; 1–100 chars
const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug must be less than 100 characters")
  .transform((s) => s.trim().toLowerCase())
  .refine(
    (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s),
    "Slug must contain only lowercase letters, numbers, and hyphens (e.g. my-course-name)"
  );

// Course schemas
export const courseSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().min(10).max(1000),
  // imageUrl can be empty/undefined while creating — make it optional
  imageUrl: z.string().optional(),
  category: objectIdSchema,
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  status: courseStatus,
  excerptDescription: z
    .string()
    .min(10, "Excerpt description must be at least 10 characters")
    .max(200, "Excerpt description must be less than 200 characters"),
  slug: slugSchema,
  // fileKey corresponds to a stored file identifier required by Prisma schema
  fileKey: z.string().optional(),
});

export const courseUpdateSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  imageUrl: z.string(),
  category: objectIdSchema,
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  status: courseStatus,
  excerptDescription: z
    .string()
    .min(10, "Excerpt description must be at least 10 characters")
    .max(200, "Excerpt description must be less than 200 characters"),
  slug: slugSchema,
});

// Chapter schemas
export const chapterSchema = z.object({
  title: z.string().min(1, "Chapter title is required").max(200),
  order: z.number().int().min(0).default(0),
});

// Lesson schemas
export const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required").max(200),
  content: z.string().default(""),
  order: z.number().int().min(0).default(0),
});

// addPointsSchema, spendPointsSchema are re-exported from @skill-learn/lib

// Quiz schemas (questionOptionSchema, questionSchema used by package quiz schemas; we don't re-export)
const questionOptionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    text: z.string().min(1, "Question text is required"),
    imageUrl: z
      .string()
      .optional()
      .refine(
        (url) => {
          // If imageUrl is provided without fileKey, it should be a Firebase Storage URL
          // If empty/undefined, it's valid (optional field)
          if (!url) return true;
          // Allow Firebase Storage URLs
          return (
            url.includes("firebasestorage.googleapis.com") ||
            url.includes("storage.googleapis.com") ||
            url.startsWith("/")
          ); // Allow local/public paths as fallback
        },
        {
          message: "Image URL must be from Firebase Storage or a local path",
        }
      ),
    fileKey: z.string().optional(), // Firebase Storage path for question image
    videoUrl: z.string().optional(),
    points: z.number().int().positive().default(1),
    options: z
      .array(questionOptionSchema)
      .min(2, "Question must have at least 2 options"),
  })
  .refine((data) => !(data.imageUrl && data.videoUrl), {
    message: "Question cannot have both imageUrl and videoUrl",
    path: ["imageUrl"],
  });

// quizCreateSchema, quizUpdateSchema, quizFinishSchema are re-exported from @skill-learn/lib

export const userUpdateSchema = libSchemas.userUpdateSchemaBase.extend({
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
