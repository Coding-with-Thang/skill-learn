import { logAuditEvent } from "@/lib/utils/auditLogger";

/**
 * Higher-order function to wrap API route handlers with audit logging
 * This function uses Prisma, so it can only be used in API routes (Node.js runtime),
 * NOT in middleware (Edge runtime)
 * 
 * @param {Function} handler - The API route handler to wrap
 * @param {Object} options - Configuration options
 * @param {boolean} options.logSuccess - Whether to log successful requests
 * @param {boolean} options.logErrors - Whether to log errors
 * @param {string} options.action - The action name to log
 * @param {string} options.resource - The resource name to log
 * @param {string} options.resourceId - The resource ID to log
 * @returns {Function} Wrapped handler function
 */
export function withAudit(handler, options = {}) {
  return async (req, res) => {
    const startTime = Date.now();

    try {
      // Execute the original handler
      const result = await handler(req, res);

      // Log successful actions if configured
      if (options.logSuccess && req.user?.id) {
        const duration = Date.now() - startTime;
        await logAuditEvent(
          req.user.id,
          options.action || req.method?.toLowerCase() || "unknown",
          options.resource || "api",
          options.resourceId,
          `API call: ${req.url} (${duration}ms)`
        );
      }

      return result;
    } catch (error) {
      // Log failed actions
      if (options.logErrors && req.user?.id) {
        await logAuditEvent(
          req.user.id,
          "error",
          options.resource || "api",
          options.resourceId,
          `API error: ${req.url} - ${error.message}`
        );
      }
      throw error;
    }
  };
}

