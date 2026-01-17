import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

/**
 * GET /api/features
 * Get all global feature definitions
 */
export async function GET(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    // Get total tenant count
    const totalTenants = await prisma.tenant.count();

    const features = await prisma.feature.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        tenantFeatures: {
          select: {
            enabled: true,
            superAdminEnabled: true,
          },
        },
      },
    });

    // Calculate effective tenant count for each feature
    const featuresWithCounts = features.map((feature) => {
      // If feature is not active, no tenants are using it
      if (!feature.isActive) {
        return {
          ...feature,
          tenantCount: 0,
        };
      }

      // Get tenants with explicit TenantFeature records
      const explicitRecords = feature.tenantFeatures || [];
      
      // Count tenants where feature is effectively enabled:
      // 1. TenantFeature exists with enabled=true AND superAdminEnabled=true
      const explicitlyEnabled = explicitRecords.filter(
        (tf) => tf.enabled && tf.superAdminEnabled
      ).length;

      // 2. TenantFeature exists with enabled=false OR superAdminEnabled=false
      const explicitlyDisabled = explicitRecords.filter(
        (tf) => !tf.enabled || !tf.superAdminEnabled
      ).length;

      // 3. Tenants without explicit records use defaultEnabled
      const tenantsWithoutRecords = totalTenants - explicitRecords.length;

      let tenantCount = 0;
      if (feature.defaultEnabled) {
        // Default enabled: count all except explicitly disabled
        tenantCount = totalTenants - explicitlyDisabled;
      } else {
        // Default disabled: count only explicitly enabled
        tenantCount = explicitlyEnabled;
      }

      return {
        id: feature.id,
        key: feature.key,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        defaultEnabled: feature.defaultEnabled,
        isActive: feature.isActive,
        icon: feature.icon,
        sortOrder: feature.sortOrder,
        tenantCount,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt,
      };
    });

    // Group by category
    const groupedByCategory = featuresWithCounts.reduce((acc, feature) => {
      const category = feature.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {});

    return NextResponse.json({
      features: featuresWithCounts,
      groupedByCategory,
    });
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/features
 * Create a new global feature
 */
export async function POST(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await request.json();
    const { key, name, description, category, defaultEnabled, isActive, icon, sortOrder } = body;

    // Validate required fields
    if (!key || !name) {
      return NextResponse.json(
        { error: "Key and name are required" },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existingFeature = await prisma.feature.findUnique({
      where: { key },
    });

    if (existingFeature) {
      return NextResponse.json(
        { error: "A feature with this key already exists" },
        { status: 400 }
      );
    }

    // Create feature
    const feature = await prisma.feature.create({
      data: {
        key,
        name,
        description: description || null,
        category: category || "general",
        defaultEnabled: defaultEnabled !== false,
        isActive: isActive !== false,
        icon: icon || null,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({
      feature: {
        id: feature.id,
        key: feature.key,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        defaultEnabled: feature.defaultEnabled,
        isActive: feature.isActive,
        icon: feature.icon,
        sortOrder: feature.sortOrder,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 }
    );
  }
}
