import { z } from "zod";

// MongoDB ObjectId validation
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const courseStatus = z.enum(["Draft", "Published", "Achieved"]);

// Array of course status values for UI components
export const courseStatusOptions = ["Draft", "Published", "Achieved"];

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
