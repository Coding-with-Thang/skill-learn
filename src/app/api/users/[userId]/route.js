import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { updateClerkUser, deleteClerkUser } from "@/lib/utils/clerk";
import { requireAdmin } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { validateRequestBody, validateRequestParams } from "@/lib/utils/validateRequest";
import { userUpdateSchema, objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";

// GET - Fetch single user
export async function GET(request, { params }) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }

        const resolvedParams = await params;
        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            resolvedParams
        );

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                manager: true,
                imageUrl: true,
                points: true,
                lifetimePoints: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError("User not found", ErrorType.NOT_FOUND, {
                status: 404,
            });
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

        const { user: currentUser } = adminResult;
        const { username, firstName, lastName, role, manager } = await validateRequestBody(request, userUpdateSchema);

        const resolvedParams = await params;
        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            resolvedParams
        );

        // Check if username exists for another user
        const existingUser = await prisma.user.findFirst({
            where: {
                username,
                NOT: {
                    id: userId,
                },
            },
        });

        if (existingUser) {
            throw new AppError("Username already exists", ErrorType.VALIDATION, {
                status: 400,
            });
        }

        // Get user to update with current role
        const userToUpdate = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                clerkId: true,
                role: true 
            }
        });

        if (!userToUpdate) {
            throw new AppError("User not found", ErrorType.NOT_FOUND, {
                status: 404,
            });
        }

        // Enforce role change restrictions
        // Managers cannot change agent roles
        if (currentUser.role === "MANAGER" && userToUpdate.role === "AGENT" && role && role !== userToUpdate.role) {
            throw new AppError("Managers cannot change agent roles", ErrorType.FORBIDDEN, {
                status: 403,
            });
        }

        // Validate manager assignment
        // Manager field should only be set for AGENT role
        const targetRole = role || userToUpdate.role;
        if (manager && manager !== "" && targetRole !== "AGENT") {
            throw new AppError("Manager can only be assigned to agents", ErrorType.VALIDATION, {
                status: 400,
            });
        }

        // Validate manager exists if provided
        if (manager && manager !== "") {
            const managerUser = await prisma.user.findUnique({
                where: { username: manager },
                select: { id: true, role: true }
            });

            if (!managerUser) {
                throw new AppError("Manager not found", ErrorType.NOT_FOUND, {
                    status: 404,
                });
            }

            if (managerUser.role !== "MANAGER") {
                throw new AppError("Assigned manager must have MANAGER role", ErrorType.VALIDATION, {
                    status: 400,
                });
            }
        }

        // Prepare update data
        const updateData = {
            username,
            firstName,
            lastName,
        };

        // Only include role if it's being changed and user has permission
        if (role !== undefined) {
            updateData.role = role;
        }

        // Only include manager if target role is AGENT
        if (targetRole === "AGENT") {
            updateData.manager = manager === "none" || manager === "" ? "" : manager;
        } else {
            // Clear manager if role is not AGENT
            updateData.manager = "";
        }

        // Update database first, then update Clerk (non-blocking)
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Update Clerk user (non-blocking - won't fail the request if Clerk fails)
        updateClerkUser(userToUpdate.clerkId, { firstName, lastName, username }).catch(err => {
            console.error("Failed to update Clerk user, but database update succeeded:", err);
        });

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

        const { user: currentUser } = adminResult;

        // Only OPERATIONS can delete users
        if (currentUser.role !== "OPERATIONS") {
            throw new AppError("Only Operations can delete users", ErrorType.FORBIDDEN, {
                status: 403,
            });
        }

        const resolvedParams = await params;
        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            resolvedParams
        );

        // Get user to delete
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { clerkId: true }
        });

        if (!user) {
            throw new AppError("User not found", ErrorType.NOT_FOUND, {
                status: 404,
            });
        }

        // Delete from both Clerk and database in parallel
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
