import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { updateClerkUser, deleteClerkUser } from "@/utils/clerk";

// GET - Fetch single user
export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify admin role
        const adminUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (!adminUser || adminUser.role !== "OPERATIONS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: params.userId },
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
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT - Update user
export async function PUT(request, { params }) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify admin role
        const adminUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (!adminUser || adminUser.role !== "OPERATIONS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await request.json();
        const { username, firstName, lastName, role, manager } = data;

        // Validate required fields
        if (!username || !firstName || !lastName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if username exists for another user
        const existingUser = await prisma.user.findFirst({
            where: {
                username,
                NOT: {
                    id: params.userId,
                },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Username already exists" },
                { status: 400 }
            );
        }        // Get user to update
        const user = await prisma.user.findUnique({
            where: { id: params.userId },
            select: { clerkId: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update both Clerk and database in parallel
        const [updatedUser] = await Promise.all([
            prisma.user.update({
                where: { id: params.userId },
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

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify admin role
        const adminUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (!adminUser || adminUser.role !== "OPERATIONS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }        // Get user to delete
        const user = await prisma.user.findUnique({
            where: { id: params.userId },
            select: { clerkId: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete from both Clerk and database in parallel
        await Promise.all([
            prisma.user.delete({
                where: { id: params.userId },
            }),
            deleteClerkUser(user.clerkId)
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
