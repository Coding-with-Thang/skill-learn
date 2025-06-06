"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/utils/axios";

export default function LifetimePointsLeaderboard({
  limit,
  skip = 0,
  className = "",
}) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get("/api/leaderboard/points");
        const filteredData = data.leaderboard.slice(
          skip,
          limit ? skip + limit : undefined
        );
        setLeaderboard(filteredData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit, skip]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (limit === 1 || limit === 2 || limit === 3) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        {leaderboard.map((entry) => (
          <div key={entry.id} className="flex flex-col items-center gap-2">
            <Image
              src={entry.image}
              alt={entry.name}
              width={64}
              height={64}
              className="rounded-full"
            />
            <p className="font-bold text-center">{entry.name}</p>
            <p className="text-sm">{entry.totalPoints} pts</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left">Rank</th>
            <th className="px-6 py-3 text-left">User</th>
            <th className="px-6 py-3 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.id} className="border-t">
              <td className="px-6 py-4">{entry.rank}</td>
              <td className="px-6 py-4 flex items-center gap-2">
                <Image
                  src={entry.image}
                  alt={entry.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                {entry.name}
              </td>
              <td className="px-6 py-4 text-right">{entry.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
