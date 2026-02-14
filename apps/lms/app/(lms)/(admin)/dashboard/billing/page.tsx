"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Badge } from "@skill-learn/ui/components/badge";
import { Progress } from "@skill-learn/ui/components/progress";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Receipt,
  Clock,
  RefreshCcw,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useBillingStore } from "@skill-learn/lib/stores/billingStore";

export default function BillingPage() {
  // Use selectors to only re-render when specific state changes
  const billing = useBillingStore((state: { billing: unknown }) => state.billing);
  const subscription = useBillingStore((state: { subscription: unknown }) => state.subscription);
  const storeLoading = useBillingStore((state: { isLoading: boolean }) => state.isLoading);
  const storeError = useBillingStore((state: { error: unknown }) => state.error);
  const fetchBillingData = useBillingStore((state: { fetchBillingData: () => void }) => state.fetchBillingData);
  const openPortal = useBillingStore((state: { openBillingPortal: () => void }) => state.openBillingPortal);
  const cancelSubscription = useBillingStore((state: { cancelSubscription: () => void }) => state.cancelSubscription);
  const resumeSubscription = useBillingStore((state: { resumeSubscription: () => void }) => state.resumeSubscription);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchBillingData();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } }; message?: string };
        setError(e.response?.data?.error || e.message || "Failed to fetch billing");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchBillingData]);

  // Combine loading states
  const isLoading = loading || storeLoading;
  const displayError = error || storeError;

  // Open Stripe billing portal
  const openBillingPortal = async () => {
    try {
      setActionLoading("portal");
      await openPortal();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(e.response?.data?.error || e.message || "Failed to open billing portal");
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.")) {
      return;
    }

    try {
      setActionLoading("cancel");
      const result = await cancelSubscription();
      toast.success(result.message || "Subscription canceled successfully");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(e.response?.data?.error || e.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  // Resume subscription
  const handleResumeSubscription = async () => {
    try {
      setActionLoading("resume");
      const result = await resumeSubscription();
      toast.success(result.message || "Subscription resumed successfully");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(e.response?.data?.error || e.message || "Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{displayError}</p>
        </CardContent>
      </Card>
    );
  }

  const { subscription: billingSubscription, usage, features, recentPayments, summary } = billing;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "trialing":
        return "bg-blue-500";
      case "past_due":
        return "bg-yellow-500";
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "free":
        return "bg-gray-500";
      case "starter":
        return "bg-green-500";
      case "pro":
        return "bg-blue-500";
      case "enterprise":
        return "bg-purple-500";
      // Legacy support
      case "professional":
        return "bg-blue-500";
      case "trial":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, view usage, and access billing history.
        </p>
      </div>

      {/* Subscription Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{billingSubscription.tierName}</p>
                  <Badge className={getTierColor(billingSubscription.tier)}>
                    ${billingSubscription.monthlyPrice}/month
                  </Badge>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusColor(billingSubscription.status)}`}
                    />
                    <p className="text-2xl font-bold capitalize">{billingSubscription.status}</p>
                  </div>
                  {billingSubscription.cancelAtPeriodEnd && (
                    <Badge variant="destructive" className="mt-1">
                      Cancels at period end
                    </Badge>
                  )}
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {new Date(billingSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {billingSubscription.daysRemaining} days remaining
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
              </CardTitle>
              <CardDescription>
                Active users in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{usage.users.current}</span>
                  <span className="text-muted-foreground">
                    of {usage.users.limit}
                  </span>
                </div>
                {usage.users.limit !== "Unlimited" && (
                  <Progress value={usage.users.percentage} />
                )}
                {usage.users.percentage >= 90 && usage.users.limit !== "Unlimited" && (
                  <p className="text-sm text-yellow-600">
                    ⚠️ Approaching user limit. Consider upgrading.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Slots
              </CardTitle>
              <CardDescription>
                Custom roles for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{usage.roleSlots.current}</span>
                  <span className="text-muted-foreground">
                    of {usage.roleSlots.limit}
                  </span>
                </div>
                <Progress value={usage.roleSlots.percentage} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Base: {usage.roleSlots.base}</span>
                  <span>Purchased: {usage.roleSlots.purchased}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              Features included in your {billingSubscription.tierName} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>
              Your billing history and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payment history yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${payment.amount.toFixed(2)}</p>
                      <Badge
                        variant={payment.status === "active" ? "default" : "secondary"}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trial Banner */}
      {subscription?.subscription?.status === "trialing" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Free Trial Active</h3>
                  <p className="text-sm text-blue-700">
                    Your trial ends on{" "}
                    {subscription?.subscription?.trialEnd
                      ? new Date(subscription.subscription.trialEnd).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                      : "soon"}
                    . Upgrade now to continue without interruption.
                  </p>
                </div>
                <Button onClick={openBillingPortal} disabled={actionLoading === "portal"}>
                  {actionLoading === "portal" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cancellation Banner */}
      {subscription?.subscription?.cancelAtPeriodEnd && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">Subscription Canceled</h3>
                  <p className="text-sm text-yellow-700">
                    Your subscription will end on{" "}
                    {subscription?.subscription?.currentPeriodEnd
                      ? new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                      : "the end of your billing period"}
                    . You&apos;ll be downgraded to the Free plan after that.
                  </p>
                </div>
                <Button
                  onClick={handleResumeSubscription}
                  disabled={actionLoading === "resume"}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {actionLoading === "resume" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCcw className="h-4 w-4 mr-2" />
                  )}
                  Resume Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Upgrade, downgrade, or manage your subscription through our billing portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {subscription?.plan?.id === "free" ? (
                <Button asChild>
                  <Link href="/pricing">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={openBillingPortal}
                    disabled={actionLoading === "portal"}
                  >
                    {actionLoading === "portal" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-2" />
                    )}
                    Manage Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openBillingPortal}
                    disabled={actionLoading === "portal"}
                  >
                    {actionLoading === "portal" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Update Payment Method
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openBillingPortal}
                    disabled={actionLoading === "portal"}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Invoices
                  </Button>
                  {!subscription?.subscription?.cancelAtPeriodEnd && (
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={actionLoading === "cancel"}
                    >
                      {actionLoading === "cancel" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Cancel Subscription
                    </Button>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              You&apos;ll be redirected to our secure billing portal powered by Stripe.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
