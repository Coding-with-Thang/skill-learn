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
// Base schemas (no refine) so consumers can .extend() then add refine
export const userCreateSchemaBase = z.object({
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
  confirmPassword: z.string().min(1, "Please confirm your password"),
  tenantRoleId: objectIdSchema.optional(),
  reportsToUserId: objectIdSchema.optional().nullable(),
});

export const userCreateSchema = userCreateSchemaBase.refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords do not match", path: ["confirmPassword"] }
);

export const userUpdateSchemaBase = z.object({
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
  confirmPassword: z.string().optional(),
  tenantRoleId: objectIdSchema.optional(),
  reportsToUserId: objectIdSchema.optional().nullable(),
});

export const userUpdateSchema = userUpdateSchemaBase.refine(
  (data) => {
    const p = data.password?.trim?.() ?? data.password ?? "";
    if (p.length === 0) return true;
    return data.confirmPassword === data.password;
  },
  { message: "Passwords do not match", path: ["confirmPassword"] }
);

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
  fileKey: z.string().optional(),
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

// Path param schema factory - for route params validation (e.g. userId, quizId, deckId)
export function pathParamSchema(paramName) {
  return z.object({ [paramName]: objectIdSchema });
}

// CMS: create tenant user (Clerk + webhook). Stricter limits than LMS userCreateSchema.
export const tenantUserCreateSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(128, "Username must be at most 128 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores")
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .transform((s) => s.trim())
    .pipe(z.string().max(100, "First name must be at most 100 characters")),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .transform((s) => s.trim())
    .pipe(z.string().max(100, "Last name must be at most 100 characters")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  email: z
    .union([
      z.string().trim().min(1).max(254).email("Please provide a valid email address"),
      z.literal(""),
      z.undefined(),
    ])
    .optional()
    .transform((v) => (v == null || v === "" ? undefined : v)),
  tenantRoleId: z
    .string()
    .min(1, "A role is required. Please select a role for the user.")
    .transform((s) => s.trim())
    .pipe(objectIdSchema),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// API-only schema for POST /api/tenants/[tenantId]/users (no confirmPassword; that is client-side only).
export const tenantUserCreateApiSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(128, "Username must be at most 128 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores")
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .transform((s) => s.trim())
    .pipe(z.string().max(100, "First name must be at most 100 characters")),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .transform((s) => s.trim())
    .pipe(z.string().max(100, "Last name must be at most 100 characters")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  email: z
    .union([
      z.string().trim().min(1).max(254).email("Please provide a valid email address"),
      z.literal(""),
      z.undefined(),
    ])
    .optional()
    .transform((v) => (v == null || v === "" ? undefined : v)),
  tenantRoleId: z
    .string()
    .min(1, "A role is required. Please select a role for the user.")
    .transform((s) => s.trim())
    .pipe(objectIdSchema),
});

// File upload metadata (for multipart/upload validation)
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});
