import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

/**
 * GET /api/features
 * Get enabled features for the current user's tenant (public - for UI visibility)
 * Returns only the features that are effectively enabled
 */
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      // For unauthenticated users (landing page), return default features
      const allFeatures = await prisma.feature.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });

      const featureFlags = {};
      allFeatures.forEach((f) => {
        featureFlags[f.key] = f.defaultEnabled;
      });

      return NextResponse.json({
        features: featureFlags,
        tenantId: null,
      });
    }

    // Get user with tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    // If no tenant, return all features as enabled (default behavior)
    if (!user.tenant) {
      const allFeatures = await prisma.feature.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });

      const featureFlags = {};
      allFeatures.forEach((f) => {
        featureFlags[f.key] = f.defaultEnabled;
      });

      return NextResponse.json({
        features: featureFlags,
        tenantId: null,
      });
    }

    // Get all global features that are active
    const allFeatures = await prisma.feature.findMany({
      where: { isActive: true },
    });

    if (!allFeatures || allFeatures.length === 0) {
      // If no features exist, return empty object (graceful degradation)
      return NextResponse.json({
        features: {},
        tenantId: user.tenant.id,
      });
    }

    // Get tenant's feature settings
    const tenantFeatures = await prisma.tenantFeature.findMany({
      where: { tenantId: user.tenant.id },
    });

    // Create a map of tenant features by featureId
    const tenantFeatureMap = new Map(
      tenantFeatures.map((tf) => [tf.featureId, tf])
    );

    // Build feature flags object
    const featureFlags = {};
    allFeatures.forEach((feature) => {
      const tenantFeature = tenantFeatureMap.get(feature.id);

      // Effective enabled state considers:
      // 1. Feature is globally active (isActive) - already filtered
      // 2. Super admin has allowed it (superAdminEnabled)
      // 3. Tenant admin has enabled it (enabled)
      const superAdminEnabled = tenantFeature?.superAdminEnabled ?? true;
      const tenantEnabled = tenantFeature?.enabled ?? feature.defaultEnabled;
      const isEffectivelyEnabled = superAdminEnabled && tenantEnabled;

      featureFlags[feature.key] = isEffectivelyEnabled;
    });

    return NextResponse.json({
      features: featureFlags,
      tenantId: user.tenant.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
