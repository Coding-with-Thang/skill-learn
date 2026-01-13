import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

/**
 * GET /api/features/[featureId]
 * Get a single feature with tenant usage stats
 */
export async function GET(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { featureId } = await params;

    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
      include: {
        tenantFeatures: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    // Count stats
    const enabledCount = feature.tenantFeatures.filter(
      (tf) => tf.enabled && tf.superAdminEnabled
    ).length;
    const disabledByAdminCount = feature.tenantFeatures.filter(
      (tf) => !tf.superAdminEnabled
    ).length;

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
        stats: {
          totalTenants: feature.tenantFeatures.length,
          enabledCount,
          disabledByAdminCount,
        },
        tenantFeatures: feature.tenantFeatures.map((tf) => ({
          id: tf.id,
          tenantId: tf.tenantId,
          tenantName: tf.tenant.name,
          tenantSlug: tf.tenant.slug,
          enabled: tf.enabled,
          superAdminEnabled: tf.superAdminEnabled,
          lastToggledAt: tf.lastToggledAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching feature:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/features/[featureId]
 * Update a global feature
 */
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { featureId } = await params;
    const body = await request.json();
    const { name, description, category, defaultEnabled, isActive, icon, sortOrder } = body;

    // Check if feature exists
    const existingFeature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!existingFeature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    // Update feature
    const feature = await prisma.feature.update({
      where: { id: featureId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(defaultEnabled !== undefined && { defaultEnabled }),
        ...(isActive !== undefined && { isActive }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
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
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/features/[featureId]
 * Delete a global feature
 */
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { featureId } = await params;

    // Check if feature exists
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
      include: {
        _count: {
          select: {
            tenantFeatures: true,
          },
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    // Delete feature (cascade will handle tenant features)
    await prisma.feature.delete({
      where: { id: featureId },
    });

    return NextResponse.json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feature:", error);
    return NextResponse.json(
      { error: "Failed to delete feature" },
      { status: 500 }
    );
  }
}
