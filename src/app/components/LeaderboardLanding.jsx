"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LeaderboardLanding() {

  const leaderboard = [
    {
      userName: "John Doe",
      userInitials: "JD",
      topScore: 25
    },
    {
      userName: "Crissy Tina",
      userInitials: "CT",
      topScore: 0
    },
    {
      userName: "Rebecca Jones",
      userInitials: "RJ",
      topScore: 0
    }
  ]

  return (
    <section className="flex flex-col gap-5 mb-9 w-full mx-auto justify-center items-center">
      <h3 className="text-xl font-bold">Leaderboard</h3>
      <div className="flex gap-5">
        <Card className="">
          <CardHeader className="flex flex-row gap-5 items-center place-content-between">
            <h4 className="text-gray-900 font-bold m-0 p-0">Top Performers - Last 30 days</h4>
            <Link href="/achievements" className="text-gray-400 m-0 p-0">View Leaderboard</Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ul className="flex flex-col gap-5 ">
              {leaderboard.map((user, index) => (
                <li key={index} className="flex gap-5 items-center place-content-between">
                  <p>{index + 1}</p>
                  <p className="rounded-full bg-green-300 p-3 font-bold">{user.userInitials}</p>
                  <p>{user.userName}</p>
                  <p>{user.topScore}</p>
                  <hr />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section >
  );
}
