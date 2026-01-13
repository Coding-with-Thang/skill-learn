"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, XCircle } from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Trigger confetti animation
    if (status === "success") {
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        // Fetch the subscription details
        const response = await fetch("/api/stripe/subscription");
        const data = await response.json();

        if (response.ok && data.subscription) {
          setSubscription(data);
          setStatus("success");
        } else {
          // Wait a bit and retry in case webhook hasn't processed yet
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const retryResponse = await fetch("/api/stripe/subscription");
          const retryData = await retryResponse.json();

          if (retryResponse.ok && retryData.subscription) {
            setSubscription(retryData);
            setStatus("success");
          } else {
            // Still show success - webhook might be delayed
            setStatus("success");
          }
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        setStatus("success"); // Show success anyway, webhook will handle the rest
      }
    };

    verifySession();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-teal mx-auto mb-4" />
          <p className="text-gray-600">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t confirm your subscription. If you were charged, don&apos;t worry
            - your subscription will be activated shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">Back to Pricing</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to {subscription?.plan?.name || "Pro"}! 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Your subscription has been activated successfully. You now have access
          to all {subscription?.plan?.name || "Pro"} features.
        </p>

        {subscription?.subscription?.trialEnd && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Your <span className="font-semibold">14-day free trial</span> has started.
              You won&apos;t be charged until{" "}
              {new Date(subscription.subscription.trialEnd).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              .
            </p>
          </div>
        )}

        {subscription?.plan?.features && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Here&apos;s what you can do now:
            </p>
            <ul className="space-y-2">
              {subscription.plan.features.slice(0, 4).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/settings/billing">View Billing Details</Link>
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          A confirmation email has been sent to your email address.
        </p>
      </motion.div>
    </div>
  );
}
