import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";

/**
 * Get dashboard statistics
 * Returns aggregated data for the CMS dashboard
 */
export async function GET(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    // Get all tenants with counts
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tenantRoles: true,
          },
        },
      },
    });

    // Get all users count
    const totalUsers = await prisma.user.count();

    // Calculate statistics
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t._count.users > 0).length;
    
    // Calculate subscription distribution
    const subscriptionDistribution = tenants.reduce((acc, tenant) => {
      const tier = tenant.subscriptionTier || 'free';
      if (!acc[tier]) {
        acc[tier] = 0;
      }
      acc[tier]++;
      return acc;
    }, {});

    // Format subscription distribution
    const subscriptionColors = {
      free: '#94A3B8',
      starter: '#10B981',
      pro: '#6366F1',
      enterprise: '#A855F7',
      // Legacy support
      professional: '#6366F1',
      trial: '#F59E0B',
    };

    const subscriptionBreakdown = Object.entries(subscriptionDistribution).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: count,
      count: count,
      color: subscriptionColors[name] || '#6B7280',
    }));

    // Calculate total active users across all tenants
    const totalActiveUsers = tenants.reduce((sum, tenant) => sum + tenant._count.users, 0);

    // Get recent tenants (last 10, ordered by creation date)
    const recentTenants = tenants
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.subscriptionTier || 'free',
        users: tenant._count.users,
        status: tenant._count.users > 0 ? 'Active' : 'Inactive',
        lastActive: tenant.updatedAt,
        createdAt: tenant.createdAt,
        roleCount: tenant._count.tenantRoles,
        maxRoleSlots: tenant.maxRoleSlots,
      }));

    // Hero stats
    const heroStats = [
      {
        id: 1,
        title: 'Total Tenants',
        value: totalTenants.toString(),
        subtitle: 'Organizations',
        trend: 0, // Can be calculated if we track historical data
        trendLabel: 'All time',
        sparklineData: [totalTenants], // Single data point for now
      },
      {
        id: 2,
        title: 'Active Tenants',
        value: activeTenants.toString(),
        subtitle: 'With users',
        trend: 0,
        trendLabel: 'All time',
        sparklineData: [activeTenants],
      },
      {
        id: 3,
        title: 'Total Users',
        value: totalActiveUsers.toLocaleString(),
        subtitle: 'Across all tenants',
        trend: 0,
        trendLabel: 'All time',
        sparklineData: [totalActiveUsers],
      },
      {
        id: 4,
        title: 'System Status',
        value: 'Operational',
        subtitle: 'All systems',
        trend: 0,
        trendLabel: 'Current',
        status: 'Healthy',
        sparklineData: [100],
      },
    ];

    // Revenue data - placeholder (can be enhanced with Stripe data if available)
    const revenueData = [
      {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mrr: 0,
        newRevenue: 0,
        churned: 0,
      },
    ];

    // System status - simplified (can be enhanced with actual monitoring)
    const systemStatus = [
      { name: 'API Server', status: 'Operational', uptime: 100, latency: null },
      { name: 'Database', status: 'Operational', uptime: 100, latency: '2ms' },
      { name: 'Storage', status: 'Operational', uptime: 100, capacity: null },
    ];

    // Resource usage - placeholder (can be enhanced with actual metrics)
    const resourceUsage = [
      { name: 'CPU', percentage: 0, status: 'healthy' },
      { name: 'Memory', percentage: 0, status: 'healthy' },
      { name: 'Disk', percentage: 0, status: 'healthy' },
    ];

    // Recent alerts - empty for now (can be enhanced with actual alert system)
    const recentAlerts = [];

    return NextResponse.json({
      heroStats,
      revenueData,
      systemStatus,
      resourceUsage,
      recentAlerts,
      subscriptionDistribution: subscriptionBreakdown,
      recentTenants,
      totals: {
        tenants: totalTenants,
        activeTenants,
        totalUsers: totalActiveUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
