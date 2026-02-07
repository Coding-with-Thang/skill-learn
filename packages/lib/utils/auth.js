import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { hasAnyPermission, getUserPermissions, isUserInTenant } from './permissions.js';

/**
 * Require authentication for API routes
 * @returns {Promise<string>} The authenticated user's Clerk ID
 * @returns {NextResponse|null} Returns 401 Unauthorized response if not authenticated, null if authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return userId;
}

/**
 * Require admin permissions for API routes (tenant-based RBAC only).
 * User must have at least one of: users.create, users.update, users.delete, dashboard.admin,
 * dashboard.manager, roles.assign, roles.create, settings.update, flashcards.manage_tenant.
 * @param {string} tenantId - Optional tenant ID to check permissions against (defaults to user's tenant)
 * @returns {Promise<{userId: string, user: object, tenantId?: string}>} The authenticated user and tenant
 * @returns {NextResponse} Returns 401 Unauthorized or 403 Forbidden if not authorized
 */
export async function requireAdmin(tenantId = null) {
  const authResult = await requireAuth();
  
  // If requireAuth returned a NextResponse (error), return it
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userId = authResult;

  // Get user with tenant info
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      tenantId: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Use tenantId from user if not provided
  const effectiveTenantId = tenantId || user.tenantId;

  // Check for admin permissions (tenant-based RBAC only)
  const adminPermissions = [
    'users.create',
    'users.update',
    'users.delete',
    'dashboard.admin',
    'dashboard.manager',
    'roles.assign',
    'roles.create',
    'settings.update',
    'flashcards.manage_tenant',
  ];

  const hasAdminPermission = await hasAnyPermission(userId, adminPermissions, effectiveTenantId);

  if (!hasAdminPermission) {
    return NextResponse.json(
      { error: "Unauthorized - Admin permissions required" },
      { status: 403 }
    );
  }

  return { 
    userId, 
    user,
    ...(effectiveTenantId && { tenantId: effectiveTenantId })
  };
}

/**
 * Require admin permissions for server actions (tenant-based RBAC only).
 * Same permission set as requireAdmin; throws instead of returning NextResponse.
 * @param {string} tenantId - Optional tenant ID to check permissions against (defaults to user's tenant)
 * @returns {Promise<{userId: string, user: object, tenantId?: string}>} The authenticated user and tenant
 * @throws {Error} If not authenticated or missing required permission
 */
export async function requireAdminForAction(tenantId = null) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      tenantId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Use tenantId from user if not provided
  const effectiveTenantId = tenantId || user.tenantId;

  // Check for admin permissions (tenant-based RBAC only)
  const adminPermissions = [
    'users.create',
    'users.update',
    'users.delete',
    'dashboard.admin',
    'dashboard.manager',
    'roles.assign',
    'roles.create',
    'settings.update',
    'flashcards.manage_tenant',
  ];

  const hasAdminPermission = await hasAnyPermission(userId, adminPermissions, effectiveTenantId);

  if (!hasAdminPermission) {
    throw new Error("Unauthorized - Admin permissions required");
  }

  return { 
    userId, 
    user,
    ...(effectiveTenantId && { tenantId: effectiveTenantId })
  };
}

/**
 * Require super admin role for CMS API routes
 * Checks Clerk metadata for 'super_admin' role
 * @returns {Promise<{userId: string}|null>} The authenticated user's Clerk ID, or null if not authorized
 * @returns {NextResponse|null} Returns 401 Unauthorized or 403 Forbidden response if not authorized, null if authorized
 */
export async function requireSuperAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check super admin role from Clerk metadata
  // Note: If custom session token claims are configured in Clerk Dashboard,
  // the role will be available directly in sessionClaims.role or sessionClaims.appRole
  // Otherwise, it might be in sessionClaims.publicMetadata.role
  const userRole = 
    sessionClaims?.role ||                    // Custom session token claim (recommended)
    sessionClaims?.appRole ||                 // Custom session token claim (recommended)
    sessionClaims?.publicMetadata?.role ||    // Fallback: if publicMetadata is included
    sessionClaims?.publicMetadata?.appRole || // Fallback: if publicMetadata is included
    sessionClaims?.metadata?.role;            // Legacy fallback

  const isSuperAdmin = userRole === 'super_admin';

  if (!isSuperAdmin) {
    // Optional: Check database as fallback (if you store super_admin in User model)
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: userId },
    //   select: { id: true, role: true },
    // });
    // 
    // if (!user || user.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json(
    //     { error: "Unauthorized - Requires super admin access" },
    //     { status: 403 }
    //   );
    // }

    return NextResponse.json(
      { error: "Unauthorized - Requires super admin access" },
      { status: 403 }
    );
  }

  return { userId };
}

/**
 * Require permission to edit a course (and thus its chapters and lessons).
 * Use this for all course/chapter/lesson admin routes. If the user can edit the course,
 * they can edit its chapters and lessons; no separate permission check for chapters/lessons.
 * @param {string} courseId - Course ID from route params
 * @returns {Promise<{userId: string, user: object, course: object, tenantId?: string}|NextResponse>}
 */
export async function requireCanEditCourse(courseId) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const userId = authResult;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, tenantId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, tenantId: true },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const courseEditPermissions = ['courses.update', 'courses.create', 'courses.delete'];
  const adminPermissions = [
    'users.create', 'users.update', 'users.delete',
    'dashboard.admin', 'dashboard.manager',
    'roles.assign', 'roles.create', 'settings.update',
    'flashcards.manage_tenant',
  ];

  if (course.tenantId) {
    const inTenant = await isUserInTenant(userId, course.tenantId);
    if (!inTenant) {
      return NextResponse.json(
        { error: "You do not have access to edit this course" },
        { status: 403 }
      );
    }
    const canEdit = await hasAnyPermission(
      userId,
      [...courseEditPermissions, ...adminPermissions],
      course.tenantId
    );
    if (!canEdit) {
      return NextResponse.json(
        { error: "You need permission to edit courses" },
        { status: 403 }
      );
    }
  } else {
    const effectiveTenantId = user.tenantId;
    const canEdit = effectiveTenantId
      ? await hasAnyPermission(
          userId,
          [...courseEditPermissions, ...adminPermissions],
          effectiveTenantId
        )
      : false;
    if (!canEdit) {
      return NextResponse.json(
        { error: "You need permission to edit courses" },
        { status: 403 }
      );
    }
  }

  return {
    userId,
    user,
    course,
    ...(course.tenantId && { tenantId: course.tenantId }),
  };
}

/**
 * Require permission to edit a quiz (and thus its questions).
 * Use for quiz admin routes. Uses tenant-based RBAC only (UserRole + TenantRole permissions).
 * @param {string} quizId - Quiz ID from route params
 * @returns {Promise<{userId: string, user: object, quiz: object, tenantId?: string}|NextResponse>}
 */
export async function requireCanEditQuiz(quizId) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const userId = authResult;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, tenantId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, tenantId: true },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const quizEditPermissions = ['quizzes.update', 'quizzes.create', 'quizzes.delete'];
  const adminPermissions = [
    'users.create', 'users.update', 'users.delete',
    'dashboard.admin', 'dashboard.manager',
    'roles.assign', 'roles.create', 'settings.update',
    'flashcards.manage_tenant',
  ];

  if (quiz.tenantId) {
    const inTenant = await isUserInTenant(userId, quiz.tenantId);
    if (!inTenant) {
      return NextResponse.json(
        { error: "You do not have access to edit this quiz" },
        { status: 403 }
      );
    }
    const canEdit = await hasAnyPermission(
      userId,
      [...quizEditPermissions, ...adminPermissions],
      quiz.tenantId
    );
    if (!canEdit) {
      return NextResponse.json(
        { error: "You need permission to edit quizzes" },
        { status: 403 }
      );
    }
  } else {
    const effectiveTenantId = user.tenantId;
    const canEdit = effectiveTenantId
      ? await hasAnyPermission(
          userId,
          [...quizEditPermissions, ...adminPermissions],
          effectiveTenantId
        )
      : false;
    if (!canEdit) {
      return NextResponse.json(
        { error: "You need permission to edit quizzes" },
        { status: 403 }
      );
    }
  }

  return {
    userId,
    user,
    quiz,
    ...(quiz.tenantId && { tenantId: quiz.tenantId }),
  };
}

