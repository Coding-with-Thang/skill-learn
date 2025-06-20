import { auth } from "@clerk/nextjs/server"
import prisma from "@/utils/connect";
import UserStats from "../components/User/UserStats";

export default async function StatsPage() {

  const { userId } = await auth()

  if (!userId) {
    return { error: "You need to be logged in to view this page" }
  }

  //Get user data --> populate the categoryStats using the category
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      categoryStats: {
        include: {
          category: true //Populate the category
        }
      }
    }
  })

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-8">
      <UserStats userStats={user} />
    </main>

  )
}