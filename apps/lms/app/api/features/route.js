import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

/**
 * GET /api/features
 * Get enabled features for the current user's tenant (public - for UI visibility)
 * Returns only the features that are effectively enabled
 */
export async function GET() {
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}
