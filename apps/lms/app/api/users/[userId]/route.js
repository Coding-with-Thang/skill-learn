import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { updateClerkUser, deleteClerkUser } from "@skill-learn/lib/utils/clerk.js";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { requirePermission, hasPermission } from "@skill-learn/lib/utils/permissions.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody, validateRequestParams } from "@skill-learn/lib/utils/validateRequest.js";
import { userUpdateSchema, objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";

// GET - Fetch single user
export async function GET(request, { params }) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }
        
        const { tenantId } = adminResult;
        
        // Check for users.read permission
        const permResult = await requirePermission('users.read', tenantId);
        if (permResult instanceof NextResponse) {
            return permResult;
        }

        const resolvedParams = await params;
        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            resolvedParams
        );

        // CRITICAL: Verify tenantId is available
        if (!tenantId) {
            throw new AppError(
                "Tenant context required",
                ErrorType.VALIDATION,
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
                points: true,
                lifetimePoints: true,
                createdAt: true,
                tenantId: true,
                reportsToUserId: true,
                reportsTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
        });

        if (!user) {
            throw new AppError("User not found", ErrorType.NOT_FOUND, {
                status: 404,
            });
        }

        // CRITICAL: Verify user belongs to the current tenant
        if (user.tenantId !== tenantId) {
            throw new AppError(
                "Access denied: User does not belong to your organization",
                ErrorType.FORBIDDEN,
                { status: 403 }
            );
        }

        return successResponse({ user });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT - Update user
export async function PUT(request, { params }) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }

        const { user: currentUser, userId: currentUserId, tenantId } = adminResult;
        
        // Check for users.update permission
        const permResult = await requirePermission('users.update', tenantId);
        if (permResult instanceof NextResponse) {
            return permResult;
        }
        
        const body = await request.json();
        const validated = await validateRequestBody(request, userUpdateSchema);
        const { username, firstName, lastName, tenantRoleId, reportsToUserId } = validated;

        const resolvedParams = await params;
        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            resolvedParams
        );

        // CRITICAL: Verify tenantId is available
        if (!tenantId) {
            throw new AppError(
                "Tenant context required",
                ErrorType.VALIDATION,
                { status: 400 }
            );
        }

        const userToUpdate = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                clerkId: true,
                tenantId: true,
                reportsToUserId: true,
            },
        });

        if (!userToUpdate) {
            throw new AppError("User not found", ErrorType.NOT_FOUND, {
                status: 404,
            });
        }

        if (userToUpdate.tenantId !== tenantId) {
            throw new AppError(
                "Access denied: User does not belong to your organization",
                ErrorType.FORBIDDEN,
                { status: 403 }
            );
        }

        // Check if username exists for another user (usernames are globally unique)
        if (username !== undefined) {
            const existingUser = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUser && existingUser.id !== userId) {
                throw new AppError("Username already exists", ErrorType.VALIDATION, {
                    status: 400,
                });
            }
        }

        // Tenant role change: requires roles.assign permission
        if (tenantRoleId !== undefined) {
            const canAssignRoles = await hasPermission(currentUserId, 'roles.assign', tenantId);
            if (!canAssignRoles) {
                throw new AppError("You do not have permission to change user roles", ErrorType.FORBIDDEN, {
                    status: 403,
                });
            }
            const roleExists = await prisma.tenantRole.findFirst({
                where: { id: tenantRoleId, tenantId, isActive: true },
            });
            if (!roleExists) {
                throw new AppError("Tenant role not found or inactive", ErrorType.NOT_FOUND, {
                    status: 404,
                });
            }
        }

        // Validate and apply reportsToUserId (same tenant, no self, no cycle)
        const newReportsTo = reportsToUserId === undefined ? undefined : (reportsToUserId === null || reportsToUserId === "" ? null : reportsToUserId);
        if (newReportsTo !== undefined) {
            if (newReportsTo === userId) {
                throw new AppError("User cannot report to themselves", ErrorType.VALIDATION, { status: 400 });
            }
            if (newReportsTo !== null) {
                const managerUser = await prisma.user.findUnique({
                    where: { id: newReportsTo },
                    select: { id: true, tenantId: true, reportsToUserId: true },
                });
                if (!managerUser || managerUser.tenantId !== tenantId) {
                    throw new AppError("Reports-to must be a user in the same organization", ErrorType.VALIDATION, { status: 400 });
                }
                // Cycle check: walking up from manager must not reach the user being updated
                let currentId = managerUser.reportsToUserId;
                while (currentId) {
                    if (currentId === userId) {
                        throw new AppError("This assignment would create a circular reporting chain", ErrorType.VALIDATION, { status: 400 });
                    }
                    const next = await prisma.user.findUnique({
                        where: { id: currentId },
                        select: { reportsToUserId: true },
                    });
                    currentId = next?.reportsToUserId ?? null;
                }
            }
        }

        // Build user update payload (profile + reportsTo)
        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (newReportsTo !== undefined) updateData.reportsToUserId = newReportsTo;

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
        }

        // Audit log when reports-to changed (Option 3)
        if (newReportsTo !== undefined && String(userToUpdate.reportsToUserId || "") !== String(newReportsTo || "")) {
            await prisma.auditLog.create({
                data: {
                    userId: adminResult.user.id,
                    action: "user.reports_to_changed",
                    resource: "user",
                    resourceId: userId,
                    details: JSON.stringify({
                        previousReportsToUserId: userToUpdate.reportsToUserId ?? null,
                        newReportsToUserId: newReportsTo ?? null,
                    }),
                },
            });
        }

        // Update tenant role assignment if tenantRoleId provided
        if (tenantRoleId !== undefined) {
            await prisma.userRole.deleteMany({
                where: { userId: userToUpdate.clerkId, tenantId },
            });
            await prisma.userRole.create({
                data: {
                    userId: userToUpdate.clerkId,
                    tenantId,
                    tenantRoleId,
                    assignedBy: currentUserId,
                },
            });
        }

        // Fetch updated user for response
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
                points: true,
                lifetimePoints: true,
                createdAt: true,
                tenantId: true,
                reportsToUserId: true,
                reportsTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
        });

        // Update Clerk profile when name/username changed
        if (Object.keys(updateData).length > 0) {
            updateClerkUser(userToUpdate.clerkId, {
                ...(firstName !== undefined && { firstName }),
                ...(lastName !== undefined && { lastName }),
                ...(username !== undefined && { username }),
            }).catch(err => {
                console.error("Failed to update Clerk user, but database update succeeded:", err);
            });
        }

        return successResponse({ user: updatedUser });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }

        const { userId: currentUserId, tenantId } = adminResult;

        // Check for users.delete permission
        const permResult = await requirePermission('users.delete', tenantId);
        if (permResult instanceof NextResponse) {
            return permResult;
        }

        const resolvedParams = await params;
        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            resolvedParams
        );

        // CRITICAL: Verify tenantId is available
        if (!tenantId) {
            throw new AppError(
                "Tenant context required",
                ErrorType.VALIDATION,
                { status: 400 }
            );
        }

        // Get user to delete with tenantId verification
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                clerkId: true,
                tenantId: true, // Include tenantId for verification
            }
        });

        if (!user) {
            throw new AppError("User not found", ErrorType.NOT_FOUND, {
                status: 404,
            });
        }

        // CRITICAL: Verify user belongs to the current tenant
        if (user.tenantId !== tenantId) {
            throw new AppError(
                "Access denied: User does not belong to your organization",
                ErrorType.FORBIDDEN,
                { status: 403 }
            );
        }

        // Clear any "reports to" references to this user, then delete
        await prisma.user.updateMany({
            where: { reportsToUserId: userId },
            data: { reportsToUserId: null },
        });
        await Promise.all([
            prisma.user.delete({
                where: { id: userId },
            }),
            deleteClerkUser(user.clerkId)
        ]);

        return successResponse({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
