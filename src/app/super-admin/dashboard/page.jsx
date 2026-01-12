import { HeroStats } from "@/components/super-admin/HeroStats";
import { RevenueChart } from "@/components/super-admin/RevenueChart";
import { TenantTable } from "@/components/super-admin/TenantTable";
import { SystemHealth } from "@/components/super-admin/SystemHealth";
import { AlertsPanel } from "@/components/super-admin/AlertsPanel";
import { SubscriptionChart } from "@/components/super-admin/SubscriptionChart";
import { QuickActions } from "@/components/super-admin/QuickActions";

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back, Super Admin. Here's what's happening today.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
          Last updated: Just now
        </div>
      </div>

      <HeroStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TenantTable />
        </div>
        <div className="space-y-6">
          <SystemHealth />
          <AlertsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubscriptionChart />
        <QuickActions />
      </div>
    </div>
  );
}
