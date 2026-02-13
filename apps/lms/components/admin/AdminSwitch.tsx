"use client";

import { forwardRef } from "react";
import { cn } from "@skill-learn/lib/utils";

/**
 * Admin dashboard switch - compact style used on Feature Management and elsewhere.
 * Use this for consistent switch appearance across admin pages (not the bulkier UI Switch).
 */
export const AdminSwitch = forwardRef(function AdminSwitch(
  { checked, onCheckedChange, disabled = false, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={!!checked}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-input",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0",
          "transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
});
