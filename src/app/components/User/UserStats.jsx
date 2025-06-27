"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { formatTime } from "@/utils/formatTime";
import { PencilLine, Crosshair, ListChecks } from 'lucide-react';
import { LoadingCard } from "@/components/ui/loading";
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
import QuizStats from "./QuizStats"
import { LoadingUserStats } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"
import api from "@/utils/axios";

export default function UserStats() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/user/stats");
        if (response.data.success) {
          setUserStats(response.data.data); // Access the data property
        } else {
          throw new Error(response.data.error || "Failed to fetch stats");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchStats();
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return <LoadingUserStats />;
  }

  if (!isSignedIn) {
    return null;
  }

  if (error) {
    return (
      <ErrorCard
        error={error}
        message="Failed to load user statistics"
      />
    );
  }

  if (!userStats) {
    return (
      <ErrorCard
        error={new Error("No stats data available")}
        message="Failed to load user statistics"
      />
    );
  }

  //Get the most recent attempt date
  const recentAttemptDate = userStats?.categoryStats?.reduce(
    (acc, curr) => {
      if (!curr.lastAttempt) return acc;
      const currentDate = new Date(curr.lastAttempt);
      return currentDate > acc ? currentDate : acc;
    },
    new Date(0)
  );

  const totalAttempts = userStats?.categoryStats?.reduce(
    (acc, curr) => acc + (curr.attempts || 0),
    0
  );

  const totalCompleted = userStats?.categoryStats?.reduce(
    (acc, curr) => acc + (curr.completed || 0),
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

  // Add error boundary for the chart components
  const renderCategoryChart = (category) => {
    try {
      return <CategoryBarChart key={category.id} categoryData={category} />;
    } catch (error) {
      return (
        <ErrorCard
          error={error}
          message={`Failed to load chart for ${category.category?.name || 'category'}`}
          className="h-full"
        />
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <BreadCrumbCom endtrail="User Stats" />
      {/* <div className="min-h-[15rem] px-8 py-6 flex items-center justify-center border-2 rounded-xl shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)] flex-col gap-4">
        <Image
          src={user?.imageUrl || "/user.png"}
          alt="Profile Image"
          width={200}
          height={200}
          className="rounded-full border-2 shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
        />
        <h2 className="font-bold text-xl mt-4">{user?.firstName} {" "} {user?.lastName}</h2>
      </div> */}
      <div className="mt-4">
        <h1 className="font-bold text-2xl">Overview</h1>
        <p className="text-muted-foreground">
          A summary of your recent activity and performance
        </p>
      </div>
      <div className="grid grid-cols-3 gap-6 font-semibold">
        <div className="py-4 px-4 flex gap-2 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
          <div className="text-2xl text-blue-400"><PencilLine /></div>
          <div>
            <p className="text-lg font-semibold">Most Recent Attempt</p>
            <p className="font-bold text-2xl">{formatTime(recentAttemptDate)}</p>
          </div>
        </div>
        <div className="py-4 px-4 flex gap-2 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
          <div className="text-2xl text-blue-400"><Crosshair /></div>
          <div>
            <p className="font-bold">Total Quizzes Attempted</p>
            <p className="mt-2 font-bold text-3xl">{totalAttempts}</p>
          </div>
        </div>
        <div className="py-4 px-4 flex gap-2 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
          <div className="text-2xl text-blue-400"><ListChecks /></div>
          <div>
            <p className="font-bold">Total Quizzes Completed</p>
            <p className="mt-2 font-bold text-3xl">{totalCompleted}</p>
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-6">
        {latestStats?.map((category) => (
          renderCategoryChart(category))
        )}
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

      <div className="mt-8">
        <QuizStats
          quizStats={userStats?.quizStats}
          categories={userStats?.categories}
        />
      </div>
    </div>
  );
}
