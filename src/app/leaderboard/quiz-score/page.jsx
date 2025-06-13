import QuizScoreLeaderboard from "@/app/components/Leaderboard/QuizScoreLeaderboard";
import BreadCrumbCom from "@/app/components/BreadCrumb"
export default function QuizScoreLeaderboardPage() {
  return (
    <div className="container mx-auto p-4">
      <div>
        <BreadCrumbCom endtrail="Quiz Score Leaderboard" />
      </div>
      <h1 className="text-2xl font-bold mb-6">
        Quiz Score Leaderboard
      </h1>
      <QuizScoreLeaderboard />
    </div>
  );
}
