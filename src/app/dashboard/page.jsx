import Link from "next/link";
export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen">
      <div className="flex flex-col gap-1 items-center justify-center w-screen h-[500px] bg-blue-500 text-gray-100">
        <h1 className="text-5xl">Skill-Learn</h1>
        <h2 className="text-lg mb-8">
          Gamify your knowledge & have a blast learning
        </h2>
      </div>

      <Link href="/dashboard/quiz/quiz-manager" className="text-center text-5xl underline mt-[10rem]">
        Quiz Manager
      </Link>
    </div>
  );
}
