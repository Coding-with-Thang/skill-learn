"use client"
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { formatTime } from "@/utils/formatTime";
import { Crosshair, ListChecks } from 'lucide-react';
import CategoryBarChart from "../User/CategoryBarChart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import BreadCrumbCom from "../BreadCrumb"

export default function UserStats({ userStats }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  //Get the most recent attempt date
  const recentAttemptDate = userStats?.categoryStats.reduce(
    (acc, curr) => {
      const currentDate = new Date(curr.lastAttempt);
      return currentDate > acc ? currentDate : acc;
    },
    new Date(0)
  );

  const totalAttempts = userStats?.categoryStats.reduce(
    (acc, curr) => acc + curr.attempts,
    0
  );

  const totalCompleted = userStats?.categoryStats.reduce(
    (acc, curr) => acc + curr.completed,
    0
  );

  //Show the 2 most recent attempts
  const latestStats = userStats?.categoryStats
    .slice(-2)
    .sort((a, b) => {
      return (
        new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime()
      );
    });

  return (
    <div className="flex flex-col gap-4">
      <BreadCrumbCom endtrail="User Stats" />
      <div className="min-h-[15rem] px-8 py-6 flex items-center justify-center border-2 rounded-xl shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)] flex-col gap-4">
        <Image
          src={user?.imageUrl || "/user.png"}
          alt="Profile Image"
          width={200}
          height={200}
          className="rounded-full border-2 shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
        />
        <h2 className="font-bold text-xl mt-4">{user?.firstName} {" "} {user?.lastName}</h2>
      </div>
      <div className="mt-4">
        <h1 className="font-bold text-2xl">Overview</h1>
        <p className="text-muted-foreground">
          A summary of your recent activity and performance
        </p>
      </div>
      <div className="grid grid-cols-3 gap-6 font-semibold">
        <div className="py-4 px-4 flex flex-col gap-1 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
          <p className="text-gray-400 font-semibold">Recent Attempt</p>
          <p className="text-sm text-gray-400 font-semibold">
            {formatTime(recentAttemptDate)}
          </p>
        </div>
        <div className="py-4 px-4 flex gap-2 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
          <div className="text-2xl text-blue-400"><Crosshair /></div>
          <div>
            <p className="font-bold">Total Attempts</p>
            <p className="mt-2 font-bold text-3xl">{totalAttempts}</p>
          </div>
        </div>
        <div className="py-4 px-4 flex gap-2 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
          <div className="text-2xl text-blue-400"><ListChecks /></div>
          <div>
            <p className="font-bold">Total Completed</p>
            <p className="mt-2 font-bold text-3xl">{totalCompleted}</p>
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-6">
        {latestStats?.map((category) => (
          <CategoryBarChart key={category.id} categoryData={category} />
        ))}
      </div>

      <div className="border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
        <Table>
          <TableHeader className="text-base font-semibold">
            <TableRow>
              <TableHead className="py-4">Category</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Average Score</TableHead>
              <TableHead>Last Attempt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userStats?.categoryStats.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-semibold py-4">
                  {category.category.name}
                </TableCell>
                <TableCell>{category.attempts}</TableCell>
                <TableCell>{category.completed}</TableCell>
                <TableCell>
                  {category.averageScore !== null
                    ? category.averageScore.toFixed(2)
                    : "N/A"}
                </TableCell>
                <TableCell>{formatTime(category.lastAttempt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
