import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { updateClerkUser, deleteClerkUser } from "@/utils/clerk";
import { requireAdmin } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";
import { validateRequestBody, validateRequestParams } from "@/utils/validateRequest";
import { userUpdateSchema, objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";

// GET - Fetch single user
export async function GET(request, { params }) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }

        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            params
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

        const { username, firstName, lastName, role, manager } = await validateRequestBody(request, userUpdateSchema);

        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            params
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

        // Get user to update
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { clerkId: true }
        });

        if (!user) {
            throw new AppError("User not found", ErrorType.NOT_FOUND, {
                status: 404,
            });
        }

        // Update both Clerk and database in parallel
        const [updatedUser] = await Promise.all([
            prisma.user.update({
                where: { id: userId },
                data: {
                    username,
                    firstName,
                    lastName,
                    role,
                    manager,
                },
            }),
            updateClerkUser(user.clerkId, { firstName, lastName })
        ]);

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

        const { userId } = await validateRequestParams(
            z.object({ userId: objectIdSchema }),
            params
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
