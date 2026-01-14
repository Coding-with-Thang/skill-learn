import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

// Default features to seed
const DEFAULT_FEATURES = [
  {
    key: "games",
    name: "Games",
    description: "Mini-games and gamification activities for user engagement",
    category: "gamification",
    defaultEnabled: true,
    isActive: true,
    icon: "Gamepad2",
    sortOrder: 1,
  },
  {
    key: "course_quizzes",
    name: "Course Quizzes",
    description: "Quizzes and assessments for training courses",
    category: "learning",
    defaultEnabled: true,
    isActive: true,
    icon: "FileQuestion",
    sortOrder: 2,
  },
  {
    key: "leaderboards",
    name: "Leaderboards",
    description: "Competitive leaderboards showing top performers",
    category: "gamification",
    defaultEnabled: true,
    isActive: true,
    icon: "Trophy",
    sortOrder: 3,
  },
  {
    key: "rewards_store",
    name: "Rewards Store",
    description: "Allow users to redeem points for rewards",
    category: "gamification",
    defaultEnabled: true,
    isActive: true,
    icon: "Gift",
    sortOrder: 4,
  },
  {
    key: "achievements",
    name: "Achievements & Badges",
    description: "Achievement badges and milestones for users",
    category: "gamification",
    defaultEnabled: true,
    isActive: true,
    icon: "Award",
    sortOrder: 5,
  },
  {
    key: "streaks",
    name: "Daily Streaks",
    description: "Track and reward consecutive daily activity",
    category: "gamification",
    defaultEnabled: true,
    isActive: true,
    icon: "Flame",
    sortOrder: 6,
  },
  {
    key: "training_courses",
    name: "Training Courses",
    description: "Video and document-based training courses",
    category: "learning",
    defaultEnabled: true,
    isActive: true,
    icon: "GraduationCap",
    sortOrder: 7,
  },
  {
    key: "point_system",
    name: "Point System",
    description: "Points earning and tracking for user activities",
    category: "gamification",
    defaultEnabled: true,
    isActive: true,
    icon: "Coins",
    sortOrder: 8,
  },
  {
    key: "categories",
    name: "Content Categories",
    description: "Organize content into categories",
    category: "learning",
    defaultEnabled: true,
    isActive: true,
    icon: "FolderTree",
    sortOrder: 9,
  },
  {
    key: "user_stats",
    name: "User Statistics",
    description: "Detailed performance analytics for users",
    category: "analytics",
    defaultEnabled: true,
    isActive: true,
    icon: "BarChart3",
    sortOrder: 10,
  },
  {
    key: "audit_logs",
    name: "Audit Logs",
    description: "Track administrative actions and changes",
    category: "admin",
    defaultEnabled: true,
    isActive: true,
    icon: "ScrollText",
    sortOrder: 11,
  },
  {
    key: "custom_roles",
    name: "Custom Roles",
    description: "Create and manage custom permission roles",
    category: "admin",
    defaultEnabled: true,
    isActive: true,
    icon: "Shield",
    sortOrder: 12,
  },
];

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
      (f) => !existingKeys.has(f.key)
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
      { status: 500 }
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
      { status: 500 }
    );
  }
}
