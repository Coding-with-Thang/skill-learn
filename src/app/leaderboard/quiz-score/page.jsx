import QuizScoreLeaderboard from "@/components/leaderboard/QuizScoreLeaderboard";

export default function QuizScoreLeaderboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Average Quiz Score Leaderboard
      </h1>
      <QuizScoreLeaderboard />
    </div>
  );
}
