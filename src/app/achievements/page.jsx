import BreadCrumbCom from "../components/BreadCrumb"


export default function AchievementsPage() {
  return (
    <section className="flex flex-col min-h-screen w-[90%] px-20">
      <BreadCrumbCom endtrail="Achievements" />
      <h1>Achievements</h1>
    </section>
  )
}