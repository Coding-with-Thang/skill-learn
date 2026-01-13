import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

/**
 * POST /api/onboarding/create-workspace
 * Create a new workspace/tenant for the authenticated user
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const body = await request.json();
    const { 
      sessionId, 
      organizationName, 
      industry, 
      teamSize, 
      subdomain 
    } = body;

    if (!organizationName?.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // Generate a unique slug from subdomain or organization name
    const baseSlug = (subdomain || organizationName)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);

    // Check if slug already exists and make it unique if needed
    let slug = baseSlug;
    let slugExists = await prisma.tenant.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await prisma.tenant.findUnique({ where: { slug } });
      counter++;
    }

    // Check if user already has a tenant
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { tenant: true },
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          username: user.username || user.primaryEmailAddress?.emailAddress?.split("@")[0] || `user_${userId.substring(0, 8)}`,
          firstName: user.firstName || "User",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl,
          role: "OWNER",
        },
      });
    }

    // If user already has a tenant, return it
    if (dbUser.tenantId) {
      const existingTenant = await prisma.tenant.findUnique({
        where: { id: dbUser.tenantId },
      });

      if (existingTenant) {
        return NextResponse.json({
          workspace: {
            id: existingTenant.id,
            name: existingTenant.name,
            slug: existingTenant.slug,
          },
          message: "Workspace already exists",
        });
      }
    }

    // Get session data for subscription info (mock or real)
    let subscriptionData = {
      subscriptionTier: "pro",
      subscriptionStatus: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };

    // Try to get real session data if available
    if (sessionId) {
      try {
        const sessionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/onboarding/validate-session?session_id=${sessionId}`
        );
        if (sessionResponse.ok) {
          const sessionInfo = await sessionResponse.json();
          subscriptionData = {
            subscriptionTier: sessionInfo.planId || "pro",
            subscriptionStatus: "active",
            stripeCustomerId: sessionInfo.customerId || null,
            stripeSubscriptionId: sessionInfo.subscriptionId || null,
          };
        }
      } catch (e) {
        console.log("Could not fetch session data, using defaults");
      }
    }

    // Create the tenant/workspace
    const tenant = await prisma.tenant.create({
      data: {
        name: organizationName,
        slug,
        subscriptionTier: subscriptionData.subscriptionTier,
        subscriptionStatus: subscriptionData.subscriptionStatus,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        // Store additional info in a way compatible with schema
        // Industry and teamSize could be stored in SystemSettings later
      },
    });

    // Update the user to link to the tenant and make them owner
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        tenantId: tenant.id,
        role: "OWNER",
      },
    });

    // Create initial system settings for the workspace
    const settingsToCreate = [
      { key: "industry", value: industry || "", category: "organization" },
      { key: "teamSize", value: teamSize || "", category: "organization" },
      { key: "onboardingCompleted", value: "false", category: "onboarding" },
      { key: "setupChecklistProgress", value: JSON.stringify([]), category: "onboarding" },
    ];

    await prisma.systemSetting.createMany({
      data: settingsToCreate.map((setting) => ({
        tenantId: tenant.id,
        key: setting.key,
        value: setting.value,
        category: setting.category,
        description: `${setting.category} setting`,
      })),
      skipDuplicates: true,
    });

    // Initialize default features for the tenant
    try {
      const defaultFeatures = await prisma.feature.findMany({
        where: { isActive: true },
      });

      if (defaultFeatures.length > 0) {
        await prisma.tenantFeature.createMany({
          data: defaultFeatures.map((feature) => ({
            tenantId: tenant.id,
            featureId: feature.id,
            enabled: feature.defaultEnabled,
            superAdminEnabled: true,
          })),
          skipDuplicates: true,
        });
      }
    } catch (e) {
      console.log("Could not initialize features:", e.message);
    }

    return NextResponse.json({
      workspace: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscriptionTier: tenant.subscriptionTier,
      },
      message: "Workspace created successfully",
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create workspace" },
      { status: 500 }
    );
  }
}
