import { z } from "zod";

// MongoDB ObjectId validation
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

// Common schemas
export const courseStatus = z.enum(["Draft", "Published", "Achieved"]);

// Array of course status values for UI components
export const courseStatusOptions = ["Draft", "Published", "Achieved"];

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
  slug: z
    .string()
    .min(5, "Slug must be at least 5 characters")
    .max(100, "Slug must be less than 100 characters"),
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
  slug: z
    .string()
    .min(5, "Slug must be at least 5 characters")
    .max(100, "Slug must be less than 100 characters"),
});

// Points schemas
export const addPointsSchema = z.object({
  amount: z
    .number()
    .int("Amount must be an integer")
    .positive("Amount must be positive")
    .max(100000, "Amount cannot exceed 100,000 points"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(200, "Reason must be less than 200 characters"),
});

export const spendPointsSchema = z.object({
  amount: z
    .number()
    .int("Amount must be an integer")
    .positive("Amount must be positive"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(200, "Reason must be less than 200 characters"),
});

// Quiz schemas
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

export const quizCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
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
  fileKey: z.string().optional(), // Firebase Storage path for quiz image
  categoryId: objectIdSchema,
  timeLimit: z.number().int().nonnegative().optional(),
  passingScore: z
    .number()
    .int()
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score cannot exceed 100")
    .optional(),
  isActive: z.boolean().optional().default(true),
  showQuestionReview: z.boolean().optional().default(true),
  showCorrectAnswers: z.boolean().optional().default(false),
  questions: z.array(questionSchema).optional(),
});

export const quizUpdateSchema = quizCreateSchema.partial().extend({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  categoryId: objectIdSchema.optional(),
});

export const quizFinishSchema = z.object({
  categoryId: objectIdSchema,
  quizId: objectIdSchema,
  score: z
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score cannot exceed 100"),
  responses: z.array(
    z.object({
      questionId: objectIdSchema,
      selectedOptionIds: z.array(objectIdSchema),
      isCorrect: z.boolean(),
      question: z.string().optional(),
      selectedAnswer: z.string().optional(),
      correctAnswer: z.string().optional(),
    })
  ),
  hasPassed: z.boolean(),
  isPerfectScore: z.boolean(),
  timeSpent: z.number().int().nonnegative().optional(),
  pointsBreakdown: z.record(z.any()).optional(),
});

// User schemas - tenant-only; roles are TenantRole via UserRole
export const userCreateSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  tenantRoleId: objectIdSchema.optional(),
  reportsToUserId: z
    .union([objectIdSchema, z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

export const userUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .optional(),
  tenantRoleId: objectIdSchema.optional(),
  reportsToUserId: z
    .union([objectIdSchema, z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

// Reward schemas
export const rewardRedeemSchema = z.object({
  rewardId: objectIdSchema,
});

export const rewardCreateSchema = z.object({
  prize: z
    .string()
    .min(1, "Prize name is required")
    .max(200, "Prize name must be less than 200 characters"),
  cost: z
    .number()
    .int("Cost must be an integer")
    .positive("Cost must be positive"),
  enabled: z.boolean().default(true),
  allowMultiple: z.boolean().default(false),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  description: z.string().optional(),
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
  fileKey: z.string().optional(), // Firebase Storage path for reward image
});

export const rewardUpdateSchema = rewardCreateSchema.partial();

// Category schemas
export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters")
    .optional(),
});

// Settings schemas
export const settingUpdateSchema = z.object({
  key: z.string().min(1, "Setting key is required"),
  value: z.string().min(1, "Setting value is required"),
});

// Settings form schema - for individual setting updates
export const settingsFormSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
);

// Flash Card schemas
export const flashCardDifficultySchema = z.enum(["easy", "good", "hard"]).nullable();

export const flashCardStudySessionSchema = z.object({
  deckId: objectIdSchema.optional(),
  deckIds: z.array(objectIdSchema).optional(), // Multiple decks combined
  categoryIds: z.array(objectIdSchema).optional(),
  virtualDeck: z.enum(["due_today", "needs_attention", "company_focus"]).optional(),
  difficulties: z.array(z.enum(["easy", "good", "hard"])).optional(), // null cards always included
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

export const flashCardBulkImportSchema = z.object({
  categoryId: objectIdSchema,
  cards: z.array(
    z.object({
      question: z.string().min(1).max(2000),
      answer: z.string().min(1).max(5000),
      tags: z.array(z.string().max(50)).optional().default([]),
      difficulty: z.enum(["easy", "good", "hard"]).nullable().optional(),
    })
  ),
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

// Admin flash card priority schemas
export const categoryPriorityAdminSchema = z.object({
  categoryId: objectIdSchema,
  priority: z.number().int().min(1).max(10),
});

// User flash card priority schemas
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
