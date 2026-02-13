"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import Link from "next/link";

export default function OnboardingStartPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("validating"); // validating, success, error, no_session
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("no_session");
      return;
    }

    validateSession();
    // validateSession is stable in intent; omit to avoid effect on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const validateSession = async () => {
    try {
      setStatus("validating");

      const response = await fetch(`/api/onboarding/validate-session?session_id=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate session");
      }

      setSessionData(data);
      setStatus("success");

      // Auto-redirect after short delay
      setTimeout(() => {
        router.push(`/onboarding/account?session_id=${sessionId}`);
      }, 2000);
    } catch (err) {
      console.error("Session validation error:", err);
      setError(err.message);
      setStatus("error");
    }
  };

  if (status === "no_session") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              No Payment Session Found
            </h1>
            <p className="text-gray-600 mb-6">
              It looks like you haven&apos;t completed a payment yet. Please choose a plan to get started.
            </p>
            <Button asChild className="w-full">
              <Link href="/pricing">
                <CreditCard className="w-5 h-5 mr-2" />
                View Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "validating") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-brand-teal mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Validating Your Payment
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Validation Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't validate your payment session. Please try again or contact support."}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={validateSession} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/pricing">Back to Pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <Card>
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Payment Successful! 🎉
          </h1>

          <p className="text-gray-600 mb-2">
            Thank you for subscribing to{" "}
            <span className="font-semibold text-gray-900">
              {sessionData?.planName || "Skill-Learn Pro"}
            </span>
          </p>

          <p className="text-sm text-gray-500 mb-8">
            Let&apos;s set up your account and workspace.
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-green-600">Payment</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-white text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-gray-600">Account</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium">
                3
              </div>
              <span className="text-sm text-gray-400">Workspace</span>
            </div>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href={`/onboarding/account?session_id=${sessionId}`}>
              Continue to Account Setup
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
