import BreadCrumbCom from "@/components/shared/BreadCrumb"


export default function AchievementsPage() {
  return (
    <section className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-8 md:px-12 py-8 gap-4">
      <BreadCrumbCom endtrail="Achievements" />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Achievements</h1>
    </section>
  )
}