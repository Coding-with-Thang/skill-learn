import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";
import { slugify } from "@skill-learn/lib/utils/utils.js";

/**
 * GET /api/changelog/[id]
 * Returns a single changelog entry
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const changelog = await prisma.changelog.findUnique({
      where: { id }
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(changelog);
  } catch (error) {
    console.error("Error fetching changelog:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelog" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/changelog/[id]
 * Updates a changelog entry
 */
export async function PATCH(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { id } = await params;
    const body = await request.json();
    
    // Auto-update slug if title changes
    if (body.title) {
        body.slug = slugify(body.title) + '-' + Math.random().toString(36).substring(2, 7);
    }

    // Convert number fields to integers
    if (body.newFeaturesCount != null) {
      const parsed = parseInt(body.newFeaturesCount, 10);
      body.newFeaturesCount = isNaN(parsed) ? 0 : parsed;
    }
    if (body.bugFixesCount != null) {
      const parsed = parseInt(body.bugFixesCount, 10);
      body.bugFixesCount = isNaN(parsed) ? 0 : parsed;
    }

    const changelog = await prisma.changelog.update({
      where: { id },
      data: body
    });

    return NextResponse.json(changelog);
  } catch (error) {
    console.error("Error updating changelog:", error);
    return NextResponse.json(
      { error: "Failed to update changelog" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/changelog/[id]
 * Deletes a changelog entry
 */
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { id } = await params;

    await prisma.changelog.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting changelog:", error);
    return NextResponse.json(
      { error: "Failed to delete changelog" },
      { status: 500 }
    );
  }
}
