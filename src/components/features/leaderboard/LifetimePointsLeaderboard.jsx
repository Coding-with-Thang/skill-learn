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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/leaderboard/points");
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch leaderboard");
        }
        const filteredData = data.leaderboard.slice(
          skip,
          limit ? skip + limit : undefined
        );
        setLeaderboard(filteredData);
        setError(null);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError(error.message || "Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit, skip]);

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">No data available</div>
    );
  }

  if (limit === 1 || limit === 2 || limit === 3) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        {leaderboard.map((entry) => (
          <div key={entry.id} className="flex flex-col items-center gap-2">
            {entry.imageUrl ? (
              <Image
                src={entry.imageUrl}
                alt={entry.username || "User"}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                {(entry.username || "?")[0].toUpperCase()}
              </div>
            )}
            <p className="font-bold text-center">
              {entry.username || "Anonymous"}
            </p>
            <p className="text-sm">{entry.totalPoints.toLocaleString()} pts</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
            <tr key={entry.id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4">{entry.rank}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt={entry.username || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                      {(entry.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <span>{entry.username || "Anonymous"}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                {entry.totalPoints.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
