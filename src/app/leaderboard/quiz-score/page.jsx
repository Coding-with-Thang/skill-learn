import QuizScoreLeaderboard from "@/components/features/leaderboard/QuizScoreLeaderboard";
import BreadCrumbCom from "@/components/shared/BreadCrumb"
export default function QuizScoreLeaderboardPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-12 py-8">
      <div>
        <BreadCrumbCom endtrail="Quiz Score Leaderboard" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Quiz Score Leaderboard
      </h1>
      <div className="overflow-x-auto">
        <QuizScoreLeaderboard />
      </div>
    </div>
  );
}
