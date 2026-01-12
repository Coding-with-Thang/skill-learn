import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import UserStats from "@/components/user/UserStats";

export default async function StatsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-8">
      <UserStats />
    </main>
  )
}