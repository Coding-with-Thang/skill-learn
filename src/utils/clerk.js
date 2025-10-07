import { clerkClient } from "@clerk/nextjs/server";

export async function updateClerkUser(userId, data) {
    try {
        const { firstName, lastName } = data;
        await clerkClient.users.updateUser(userId, {
            firstName,
            lastName,
        });
    } catch (error) {
        console.error("Error updating Clerk user:", error);
        throw error;
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
