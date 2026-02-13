import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { slugify } from "@skill-learn/lib/utils/utils";

/**
 * GET /api/changelog
 * Returns all changelog entries
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const where = publishedOnly ? { published: true } : {};

    const changelogs = await prisma.changelog.findMany({
      where,
      orderBy: {
        releaseDate: 'desc'
      }
    });

    return NextResponse.json(changelogs);
  } catch (error) {
    console.error("Error fetching changelogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelogs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/changelog
 * Creates a new changelog entry
 */
export async function POST(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await request.json();
    const { title, content, version, imageUrl, fileKey, releaseDate, published, tags, newFeaturesCount, bugFixesCount, apiDocsUrl, githubRepoUrl, authorName, authorImage } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const slug = slugify(title) + '-' + Math.random().toString(36).substring(2, 7);

    // Convert number fields to integers
    const newFeaturesCountInt = newFeaturesCount != null ? parseInt(newFeaturesCount, 10) : 0;
    const bugFixesCountInt = bugFixesCount != null ? parseInt(bugFixesCount, 10) : 0;

    const changelog = await prisma.changelog.create({
      data: {
        title,
        slug,
        content,
        version,
        imageUrl,
        fileKey,
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        published: published || false,
        tags: tags || [],
        newFeaturesCount: isNaN(newFeaturesCountInt) ? 0 : newFeaturesCountInt,
        bugFixesCount: isNaN(bugFixesCountInt) ? 0 : bugFixesCountInt,
        apiDocsUrl,
        githubRepoUrl,
        authorName,
        authorImage,
        authorId: adminResult.userId, // Clerk ID
      }
    });

    return NextResponse.json(changelog);
  } catch (error) {
    console.error("Error creating changelog:", error);
    return NextResponse.json(
      { error: "Failed to create changelog" },
      { status: 500 }
    );
  }
}
