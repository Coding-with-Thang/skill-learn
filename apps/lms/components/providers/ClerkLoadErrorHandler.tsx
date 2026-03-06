"use client";

import { useEffect, useState } from "react";

/**
 * Catches ClerkRuntimeError "failed_to_load_clerk_js" (e.g. when ad blockers
 * block clerk.accounts.dev) and shows a friendly message instead of a crash.
 */
export function ClerkLoadErrorHandler({ children }: { children: React.ReactNode }) {
  const [clerkError, setClerkError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const err = event?.reason;
      const msg = err?.message ?? String(err);
      const code = (err as { code?: string })?.code;
      if (
        code === "failed_to_load_clerk_js" ||
        msg?.includes("failed to load script") ||
        msg?.includes("Failed to load Clerk")
      ) {
        setClerkError(msg);
        event.preventDefault?.();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  if (clerkError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-3">
            Sign-in could not load
          </h1>
          <p className="text-slate-600 mb-6">
            This often happens when an ad blocker or privacy extension blocks
            authentication. Try:
          </p>
          <ul className="text-left text-slate-600 space-y-2 mb-6 text-sm">
            <li>• Disable ad blockers for this site</li>
            <li>• Use a private/incognito window without extensions</li>
            <li>• Refresh the page</li>
          </ul>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
