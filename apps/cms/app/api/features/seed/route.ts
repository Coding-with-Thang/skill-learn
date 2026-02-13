import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { DEFAULT_FEATURES } from "@skill-learn/lib/constants/defaultFeatures";

/**
 * POST /api/features/seed
 * Seed default features (only creates if they don't exist)
 */
export async function POST(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    // Get existing features
    const existingFeatures = await prisma.feature.findMany();
    const existingKeys = new Set(existingFeatures.map((f) => f.key));

    // Filter out features that already exist
    const newFeatures = DEFAULT_FEATURES.filter(
      (f) => !existingKeys.has(f.key),
    );

    if (newFeatures.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All default features already exist",
        createdCount: 0,
        existingCount: existingFeatures.length,
      });
    }

    // Create new features
    await prisma.feature.createMany({
      data: newFeatures,
    });

    return NextResponse.json({
      success: true,
      message: `Created ${newFeatures.length} new feature(s)`,
      createdCount: newFeatures.length,
      createdFeatures: newFeatures.map((f) => f.key),
      existingCount: existingFeatures.length,
    });
  } catch (error) {
    console.error("Error seeding features:", error);
    return NextResponse.json(
      { error: "Failed to seed features" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/features/seed
 * Get the list of default features that would be seeded
 */
export async function GET(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    return NextResponse.json({
      defaultFeatures: DEFAULT_FEATURES,
    });
  } catch (error) {
    console.error("Error getting seed features:", error);
    return NextResponse.json(
      { error: "Failed to get seed features" },
      { status: 500 },
    );
  }
}
