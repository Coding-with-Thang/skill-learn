import { clerkClient } from "@clerk/nextjs/server";

export async function updateClerkUser(userId: string, data: { firstName?: string; lastName?: string; username?: string }) {
    try {
        const client = await clerkClient();
        if (!client?.users) {
            console.error("Clerk client is not properly initialized");
            return;
        }

        const { firstName, lastName, username } = data;
        const updateData: { firstName?: string; lastName?: string; username?: string } = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (username !== undefined) updateData.username = username;

        if (Object.keys(updateData).length > 0) {
            await client.users.updateUser(userId, updateData);
        }
    } catch (error) {
        console.error("Error updating Clerk user:", error);
    }
}

export async function deleteClerkUser(userId: string) {
    try {
        const client = await clerkClient();
        await client.users.deleteUser(userId);
    } catch (error) {
        console.error("Error deleting Clerk user:", error);
        throw error;
    }
}
