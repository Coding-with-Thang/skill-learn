import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/tenants/[tenantId]/features
 * Get all features for a specific tenant (with their enabled/disabled status)
 */
export async function GET(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get all global features
    const allFeatures = await prisma.feature.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    // Get tenant's feature settings
    const tenantFeatures = await prisma.tenantFeature.findMany({
      where: { tenantId },
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
      
      return {
        id: feature.id,
        key: feature.key,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        icon: feature.icon,
        sortOrder: feature.sortOrder,
        defaultEnabled: feature.defaultEnabled,
        // Tenant-specific settings (or defaults if not configured)
        tenantFeatureId: tenantFeature?.id || null,
        enabled: tenantFeature?.enabled ?? feature.defaultEnabled,
        superAdminEnabled: tenantFeature?.superAdminEnabled ?? true,
        lastToggledAt: tenantFeature?.lastToggledAt || null,
        lastToggledBy: tenantFeature?.lastToggledBy || null,
        // Computed: effective status (enabled AND superAdminEnabled AND feature.isActive)
        isEffectivelyEnabled:
          (tenantFeature?.enabled ?? feature.defaultEnabled) &&
          (tenantFeature?.superAdminEnabled ?? true) &&
          feature.isActive,
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

    return NextResponse.json({
      tenantId,
      tenantName: tenant.name,
      features,
      groupedByCategory,
    });
  } catch (error) {
    console.error("Error fetching tenant features:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant features" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tenants/[tenantId]/features
 * Update feature settings for a tenant (super admin only)
 * Body: { featureId, superAdminEnabled, enabled? }
 */
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { userId } = await auth();
    const { tenantId } = await params;
    const body = await request.json();
    const { featureId, superAdminEnabled, enabled } = body;

    // Validate required fields
    if (!featureId) {
      return NextResponse.json(
        { error: "featureId is required" },
        { status: 400 }
      );
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check if feature exists
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    // Upsert tenant feature
    const tenantFeature = await prisma.tenantFeature.upsert({
      where: {
        tenantId_featureId: {
          tenantId,
          featureId,
        },
      },
      create: {
        tenantId,
        featureId,
        enabled: enabled ?? feature.defaultEnabled,
        superAdminEnabled: superAdminEnabled ?? true,
        superAdminLockedAt: superAdminEnabled !== undefined ? new Date() : null,
        lastToggledBy: userId,
        lastToggledAt: new Date(),
      },
      update: {
        ...(superAdminEnabled !== undefined && {
          superAdminEnabled,
          superAdminLockedAt: new Date(),
        }),
        ...(enabled !== undefined && { enabled }),
        lastToggledBy: userId,
        lastToggledAt: new Date(),
      },
      include: {
        feature: true,
      },
    });

    return NextResponse.json({
      tenantFeature: {
        id: tenantFeature.id,
        tenantId: tenantFeature.tenantId,
        featureId: tenantFeature.featureId,
        featureKey: tenantFeature.feature.key,
        featureName: tenantFeature.feature.name,
        enabled: tenantFeature.enabled,
        superAdminEnabled: tenantFeature.superAdminEnabled,
        superAdminLockedAt: tenantFeature.superAdminLockedAt,
        lastToggledAt: tenantFeature.lastToggledAt,
        lastToggledBy: tenantFeature.lastToggledBy,
        isEffectivelyEnabled:
          tenantFeature.enabled &&
          tenantFeature.superAdminEnabled &&
          tenantFeature.feature.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating tenant feature:", error);
    return NextResponse.json(
      { error: "Failed to update tenant feature" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/features
 * Initialize all features for a tenant with default settings
 */
export async function POST(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { userId } = await auth();
    const { tenantId } = await params;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get all active features
    const allFeatures = await prisma.feature.findMany({
      where: { isActive: true },
    });

    // Get existing tenant features
    const existingTenantFeatures = await prisma.tenantFeature.findMany({
      where: { tenantId },
    });

    const existingFeatureIds = new Set(
      existingTenantFeatures.map((tf) => tf.featureId)
    );

    // Create tenant features for features that don't have settings yet
    const newTenantFeatures = allFeatures
      .filter((f) => !existingFeatureIds.has(f.id))
      .map((f) => ({
        tenantId,
        featureId: f.id,
        enabled: f.defaultEnabled,
        superAdminEnabled: true,
        lastToggledBy: userId,
        lastToggledAt: new Date(),
      }));

    if (newTenantFeatures.length > 0) {
      await prisma.tenantFeature.createMany({
        data: newTenantFeatures,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${newTenantFeatures.length} feature(s) for tenant`,
      initializedCount: newTenantFeatures.length,
    });
  } catch (error) {
    console.error("Error initializing tenant features:", error);
    return NextResponse.json(
      { error: "Failed to initialize tenant features" },
      { status: 500 }
    );
  }
}
