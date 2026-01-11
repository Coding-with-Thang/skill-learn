import { clerkClient } from "@clerk/nextjs/server";

export async function updateClerkUser(userId, data) {
    try {
        if (!clerkClient || !clerkClient.users) {
            console.error("Clerk client is not properly initialized");
            return; // Fail silently if Clerk is not available
        }

        const { firstName, lastName, username } = data;
        const updateData = {};
        
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (username !== undefined) updateData.username = username;

        if (Object.keys(updateData).length > 0) {
            await clerkClient.users.updateUser(userId, updateData);
        }
    } catch (error) {
        console.error("Error updating Clerk user:", error);
        // Don't throw - allow the database update to succeed even if Clerk update fails
        // This prevents blocking user updates if Clerk has issues
    }
}

export async function deleteClerkUser(userId) {
    try {
        await clerkClient.users.deleteUser(userId);
    } catch (error) {
        console.error("Error deleting Clerk user:", error);
        throw error;
    }
}
