import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

/**
 * Helper to check if user has admin role in their tenant
 */
async function requireTenantAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Get user with tenant
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: true,
    },
  });

  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  if (!user.tenant) {
    return { error: NextResponse.json({ error: "No tenant assigned" }, { status: 403 }) };
  }

  // Check if user has admin role (checking for permissions like features.manage or admin roles)
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      tenantId: user.tenant.id,
    },
    include: {
      tenantRole: {
        include: {
          tenantRolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Check if user has features.manage permission or is an admin (tenant RBAC only)
  const hasPermission = userRoles.some((ur) => {
    return ur.tenantRole.tenantRolePermissions.some(
      (trp) =>
        trp.permission.name === "features.manage" ||
        trp.permission.name === "admin.full" ||
        trp.permission.category === "admin"
    );
  });

  if (!hasPermission) {
    return { error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }

  return { user, tenant: user.tenant, userId };
}

/**
 * GET /api/tenant/features
 * Get all features for the current user's tenant
 */
export async function GET() {
  try {
    const result = await requireTenantAdmin();
    if (result.error) {
      return result.error;
    }

    const { tenant } = result;

    // Get all global features that are active
    const allFeatures = await prisma.feature.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    // Get tenant's feature settings
    const tenantFeatures = await prisma.tenantFeature.findMany({
      where: { tenantId: tenant.id },
      include: {
        feature: true,
      },
    });

    // Create a map of tenant features by featureId
    const tenantFeatureMap = new Map(
      tenantFeatures.map((tf) => [tf.featureId, tf])
    );

    // Merge global features with tenant settings
    const features = allFeatures.map((feature) => {
      const tenantFeature = tenantFeatureMap.get(feature.id);

      // Effective enabled state considers:
      // 1. Feature is globally active (isActive)
      // 2. Super admin has allowed it (superAdminEnabled)
      // 3. Tenant admin has enabled it (enabled)
      const superAdminEnabled = tenantFeature?.superAdminEnabled ?? true;
      const tenantEnabled = tenantFeature?.enabled ?? feature.defaultEnabled;
      const isEffectivelyEnabled =
        feature.isActive && superAdminEnabled && tenantEnabled;

      return {
        id: feature.id,
        key: feature.key,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        icon: feature.icon,
        sortOrder: feature.sortOrder,
        // Tenant-specific settings
        tenantFeatureId: tenantFeature?.id || null,
        enabled: tenantEnabled,
        // Super admin control - if false, tenant admin cannot enable
        superAdminEnabled,
        // Can tenant admin toggle this feature?
        canToggle: superAdminEnabled,
        // Computed effective status
        isEffectivelyEnabled,
        lastToggledAt: tenantFeature?.lastToggledAt || null,
      };
    });

    // Group by category
    const groupedByCategory = features.reduce((acc, feature) => {
      const category = feature.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {});

    // Calculate summary
    const summary = {
      total: features.length,
      enabled: features.filter((f) => f.isEffectivelyEnabled).length,
      disabled: features.filter((f) => !f.isEffectivelyEnabled).length,
      locked: features.filter((f) => !f.superAdminEnabled).length,
    };

    return NextResponse.json({
      tenantId: tenant.id,
      tenantName: tenant.name,
      features,
      groupedByCategory,
      summary,
    });
  } catch (error) {
    console.error("Error fetching tenant features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tenant/features
 * Toggle a feature for the current tenant (tenant admin only)
 * Body: { featureId, enabled }
 */
export async function PUT(request) {
  try {
    const result = await requireTenantAdmin();
    if (result.error) {
      return result.error;
    }

    const { tenant, userId } = result;
    const body = await request.json();
    const { featureId, enabled } = body;

    // Validate required fields
    if (!featureId || enabled === undefined) {
      return NextResponse.json(
        { error: "featureId and enabled are required" },
        { status: 400 }
      );
    }

    // Check if feature exists and is active
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    if (!feature.isActive) {
      return NextResponse.json(
        { error: "This feature is globally disabled" },
        { status: 400 }
      );
    }

    // Check if tenant feature exists and if super admin has allowed it
    const existingTenantFeature = await prisma.tenantFeature.findUnique({
      where: {
        tenantId_featureId: {
          tenantId: tenant.id,
          featureId,
        },
      },
    });

    // If super admin has disabled this feature, tenant admin cannot enable it
    if (existingTenantFeature && !existingTenantFeature.superAdminEnabled) {
      return NextResponse.json(
        { error: "This feature has been disabled by the administrator" },
        { status: 403 }
      );
    }

    // Upsert tenant feature
    const tenantFeature = await prisma.tenantFeature.upsert({
      where: {
        tenantId_featureId: {
          tenantId: tenant.id,
          featureId,
        },
      },
      create: {
        tenantId: tenant.id,
        featureId,
        enabled,
        superAdminEnabled: true,
        lastToggledBy: userId,
        lastToggledAt: new Date(),
      },
      update: {
        enabled,
        lastToggledBy: userId,
        lastToggledAt: new Date(),
      },
      include: {
        feature: true,
      },
    });

    return NextResponse.json({
      success: true,
      tenantFeature: {
        id: tenantFeature.id,
        tenantId: tenantFeature.tenantId,
        featureId: tenantFeature.featureId,
        featureKey: tenantFeature.feature.key,
        featureName: tenantFeature.feature.name,
        enabled: tenantFeature.enabled,
        superAdminEnabled: tenantFeature.superAdminEnabled,
        canToggle: tenantFeature.superAdminEnabled,
        isEffectivelyEnabled:
          tenantFeature.enabled &&
          tenantFeature.superAdminEnabled &&
          tenantFeature.feature.isActive,
        lastToggledAt: tenantFeature.lastToggledAt,
      },
    });
  } catch (error) {
    console.error("Error updating tenant feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}
