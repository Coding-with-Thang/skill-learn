"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

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
        const response = await fetch("/api/leaderboard/points");
        const data = await response.json();
        const filteredData = data.slice(skip, limit ? skip + limit : undefined);
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
      // ...existing table code...
    </div>
  );
}
