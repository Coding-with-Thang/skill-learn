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

    const features = await prisma.feature.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            tenantFeatures: true,
          },
        },
      },
    });

    // Group by category
    const groupedByCategory = features.reduce((acc, feature) => {
      const category = feature.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: feature.id,
        key: feature.key,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        defaultEnabled: feature.defaultEnabled,
        isActive: feature.isActive,
        icon: feature.icon,
        sortOrder: feature.sortOrder,
        tenantCount: feature._count.tenantFeatures,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt,
      });
      return acc;
    }, {});

    return NextResponse.json({
      features: features.map((f) => ({
        id: f.id,
        key: f.key,
        name: f.name,
        description: f.description,
        category: f.category,
        defaultEnabled: f.defaultEnabled,
        isActive: f.isActive,
        icon: f.icon,
        sortOrder: f.sortOrder,
        tenantCount: f._count.tenantFeatures,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
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
