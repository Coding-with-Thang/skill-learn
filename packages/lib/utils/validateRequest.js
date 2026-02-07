import { z } from "zod";
import { AppError, ErrorType } from "./errorHandler.js";

/**
 * Validate request body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {Promise<any>} Validated and parsed data
 * @throws {AppError} If validation fails
 */
export async function validateRequest(schema, data) {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors into a readable message
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join(".");
        return path ? `${path}: ${err.message}` : err.message;
      });

      throw new AppError(
        `Validation failed: ${errorMessages.join(", ")}`,
        ErrorType.VALIDATION,
        {
          status: 400,
          details: error.errors,
        }
      );
    }
    throw error;
  }
}

/**
 * Validate request body from JSON
 * @param {Request} request - Next.js request object
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Promise<any>} Validated and parsed data
 */
export async function validateRequestBody(request, schema) {
  const body = await request.json();
  return validateRequest(schema, body);
}

/**
 * Validate request params (URL parameters)
 * Next.js 16: params is a Promise and must be awaited
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {Promise<any>|any} params - Params from Next.js route (Promise in Next 16+)
 * @returns {Promise<any>} Validated and parsed params
 */
export async function validateRequestParams(schema, params) {
  const resolved = params && typeof params.then === "function" ? await params : params;
  return validateRequest(schema, resolved);
}

