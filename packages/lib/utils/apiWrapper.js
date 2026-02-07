import { NextResponse } from "next/server";
import { handleApiError, AppError, ErrorType } from "./errorHandler.js";

/**
 * API Route Wrapper for consistent error handling
 * Wraps API route handlers to provide standardized error handling
 * 
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Optional configuration
 * @param {boolean} options.requireAuth - Whether authentication is required (default: false)
 * @param {boolean} options.requireAdmin - Whether admin role is required (default: false)
 * @returns {Function} Wrapped handler function
 * 
 * @example
 * export const GET = apiWrapper(async (request) => {
 *   // Your route logic here
 *   return NextResponse.json({ data: "success" });
 * });
 */
export function apiWrapper(handler, options = {}) {
  return async (request, context) => {
    try {
      // Execute the handler
      const response = await handler(request, context);
      
      // If handler returns a NextResponse, return it directly
      if (response instanceof NextResponse) {
        return response;
      }
      
      // If handler returns data, wrap it in NextResponse
      return NextResponse.json(response);
    } catch (error) {
      // Handle AppError instances
      if (error instanceof AppError) {
        return handleApiError(error);
      }
      
      // Handle validation errors
      if (error.name === "ZodError") {
        return handleApiError(
          new AppError(
            "Validation error",
            ErrorType.VALIDATION,
            { status: 400, details: error.errors }
          )
        );
      }
      
      // Handle Prisma errors
      if (error.code === "P2002") {
        return handleApiError(
          new AppError(
            "Duplicate entry - this record already exists",
            ErrorType.VALIDATION,
            { status: 409 }
          )
        );
      }
      
      if (error.code === "P2025") {
        return handleApiError(
          new AppError(
            "Record not found",
            ErrorType.NOT_FOUND,
            { status: 404 }
          )
        );
      }
      
      // Handle generic errors
      return handleApiError(error);
    }
  };
}

/**
 * Create a standardized success response
 * @param {any} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {NextResponse} Success response
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 * @param {ErrorType} type - Error type (default: ErrorType.UNKNOWN)
 * @returns {NextResponse} Error response
 */
export function errorResponse(message, status = 400, type = ErrorType.UNKNOWN) {
  return handleApiError(
    new AppError(message, type, { status })
  );
}

