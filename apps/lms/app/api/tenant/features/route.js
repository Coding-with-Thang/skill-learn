import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";

/**
 * Helper to check if user has admin role in their tenant
 * @throws {AppError} when unauthorized, user not found, no tenant, or insufficient permissions
 */
async function requireTenantAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { tenant: true },
  });

  if (!user) {
    throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
  }

  if (!user.tenant) {
    throw new AppError("No tenant assigned", ErrorType.AUTH, { status: 403 });
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId, tenantId: user.tenant.id },
    include: {
      tenantRole: {
        include: {
          tenantRolePermissions: { include: { permission: true } },
        },
      },
    },
  });

  const hasPermission = userRoles.some((ur) =>
    ur.tenantRole.tenantRolePermissions.some(
      (trp) =>
        trp.permission.name === "features.manage" ||
        trp.permission.name === "admin.full" ||
        trp.permission.category === "admin"
    )
  );

  if (!hasPermission) {
    throw new AppError("Insufficient permissions", ErrorType.AUTH, { status: 403 });
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
    return handleApiError(error);
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
    const { tenant, userId } = result;
    const body = await request.json();
    const { featureId, enabled } = body;

    if (!featureId || enabled === undefined) {
      throw new AppError("featureId and enabled are required", ErrorType.VALIDATION, { status: 400 });
    }

    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      throw new AppError("Feature not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    if (!feature.isActive) {
      throw new AppError("This feature is globally disabled", ErrorType.VALIDATION, { status: 400 });
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
      throw new AppError("This feature has been disabled by the administrator", ErrorType.AUTH, { status: 403 });
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
    return handleApiError(error);
  }
}
