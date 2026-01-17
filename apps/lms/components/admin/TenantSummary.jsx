"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Badge } from "@skill-learn/ui/components/badge";
import { Progress } from "@skill-learn/ui/components/progress";
import {
  Building2,
  CreditCard,
  Shield,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useBillingStore } from "@skill-learn/lib/stores/billingStore.js";

export function TenantSummary() {
  // Use selectors to only re-render when specific state changes
  const tenant = useBillingStore((state) => state.tenant);
  const billing = useBillingStore((state) => state.billing);
  const loading = useBillingStore((state) => state.isLoading);
  const fetchTenantAndBilling = useBillingStore((state) => state.fetchTenantAndBilling);

  useEffect(() => {
    fetchTenantAndBilling();
  }, [fetchTenantAndBilling]);

  if (loading) {
    return (
      <Card className="shadow-sm border-none">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!tenant) {
    return null;
  }

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "free":
        return "bg-gray-500 text-white";
      case "starter":
        return "bg-green-500 text-white";
      case "pro":
        return "bg-blue-500 text-white";
      case "enterprise":
        return "bg-purple-500 text-white";
      // Legacy support
      case "professional":
        return "bg-blue-500 text-white";
      case "trial":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "trialing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "past_due":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="shadow-sm border-none bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Overview
          </CardTitle>
          <Badge className={getTierColor(tenant.subscriptionTier)}>
            {billing?.subscription?.tierName || tenant.subscriptionTier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold">{tenant.name}</p>
            <p className="text-sm text-muted-foreground">@{tenant.slug}</p>
          </div>
          {billing?.subscription && (
            <Badge className={getStatusColor(billing.subscription.status)}>
              {billing.subscription.status}
            </Badge>
          )}
        </div>

        {billing?.subscription && (
          <div className="text-sm text-muted-foreground">
            {billing.subscription.daysRemaining} days until next billing
          </div>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Users
              </span>
              <span className="font-medium">
                {billing?.usage?.users?.current || tenant.stats?.users || 0}
                {billing?.usage?.users?.limit !== "Unlimited" && (
                  <span className="text-muted-foreground">
                    /{billing?.usage?.users?.limit}
                  </span>
                )}
              </span>
            </div>
            {billing?.usage?.users?.limit !== "Unlimited" && (
              <Progress
                value={billing?.usage?.users?.percentage || 0}
                className="h-1.5"
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Roles
              </span>
              <span className="font-medium">
                {billing?.usage?.roleSlots?.current || tenant.stats?.roles || 0}
                <span className="text-muted-foreground">
                  /{billing?.usage?.roleSlots?.limit || tenant.maxRoleSlots}
                </span>
              </span>
            </div>
            <Progress
              value={billing?.usage?.roleSlots?.percentage || 0}
              className="h-1.5"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/dashboard/billing">
            <Button variant="outline" size="sm" className="h-8">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Billing
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
          <Link href="/dashboard/roles">
            <Button variant="outline" size="sm" className="h-8">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Manage Roles
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default TenantSummary;
