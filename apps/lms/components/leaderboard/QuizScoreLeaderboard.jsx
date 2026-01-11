"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@skill-learn/lib/utils/axios.js";

export default function QuizScoreLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get("/leaderboard/quiz-score");
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left">Rank</th>
            <th className="px-6 py-3 text-left">User</th>
            <th className="px-6 py-3 text-right">Average Score</th>
            <th className="px-6 py-3 text-right">Quizzes Taken</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.id} className="border-t">
              <td className="px-6 py-4">{entry.rank}</td>
              <td className="px-6 py-4 flex items-center gap-2">
                {entry.imageUrl ? (
                  <Image
                    src={entry.imageUrl}
                    alt={entry.username}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                    {(entry.username || "?")[0].toUpperCase()}
                  </div>
                )}
                {entry.name}
              </td>
              <td className="px-6 py-4 text-right">
                {entry.averageScore.toFixed(1)}%
              </td>
              <td className="px-6 py-4 text-right">{entry.quizzesTaken}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
