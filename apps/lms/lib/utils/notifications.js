/**
 * Standardized notification utility for user-facing messages
 * Use this instead of console.error for user notifications
 */

import { toast } from "sonner";

/**
 * Show a success notification
 * @param {string} message - Success message to display
 */
export function notifySuccess(message) {
  toast.success(message);
}

/**
 * Show an error notification
 * @param {string|Error} error - Error message or Error object
 * @param {string} fallbackMessage - Fallback message if error doesn't have a message
 */
export function notifyError(error, fallbackMessage = "An error occurred") {
  const message =
    typeof error === "string"
      ? error
      : error?.response?.data?.error ||
        error?.message ||
        fallbackMessage;
  toast.error(message);
}

/**
 * Show a warning notification
 * @param {string} message - Warning message to display
 */
export function notifyWarning(message) {
  toast.warning(message);
}

/**
 * Show an info notification
 * @param {string} message - Info message to display
 */
export function notifyInfo(message) {
  toast.info(message);
}

/**
 * Handle API errors with user notification
 * Logs to console for debugging and shows toast to user
 * @param {Error} error - Error object
 * @param {string} fallbackMessage - Fallback message
 * @param {boolean} logToConsole - Whether to log to console (default: true in development)
 */
export function handleErrorWithNotification(
  error,
  fallbackMessage = "An error occurred",
  logToConsole = process.env.NODE_ENV === "development"
) {
  const message =
    error?.response?.data?.error || error?.message || fallbackMessage;

  // Log to console for debugging (only in development)
  if (logToConsole) {
    console.error("Error:", error);
  }

  // Show toast notification to user
  toast.error(message);

  return message;
}

