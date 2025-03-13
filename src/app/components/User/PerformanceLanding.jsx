"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Circle, Eclipse, GraduationCap, Maximize, NotebookPen, Star } from "lucide-react";

export default function PerformanceLanding() {

  const topicsProgress = [
    {
      topicLevel: "Not Started",
      topicCount: 18,
      topicCategoryIcon: Circle
    },
    {
      topicLevel: "Beginner",
      topicCount: 1,
      topicCategoryIcon: Eclipse
    },
    {
      topicLevel: "Intermediate",
      topicCount: 0,
      topicCategoryIcon: Maximize
    },
    {
      topicLevel: "Graduated",
      topicCount: 1,
      topicCategoryIcon: GraduationCap
    },
    {
      topicLevel: "Expert",
      topicCount: 0,
      topicCategoryIcon: Star
    }
  ]

  return (
    <section className="flex flex-col gap-5 mb-9 w-full mx-auto justify-center items-center">
      <h3 className="text-xl font-bold">Your Performance</h3>
      <div className="flex gap-5">
        <Card className="">
          <CardHeader className="flex flex-row gap-5 items-center place-content-between">
            <h4 className="text-gray-900 font-bold m-0 p-0">Achievements</h4>
            <Link href="/achievements" className="text-gray-400 m-0 p-0">View Achievements</Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 items-start">
          </CardContent>
        </Card>

        <Card className="min-w-96">
          <CardHeader className="flex flex-row gap-3">
            <NotebookPen />
            <CardTitle>Topic Progress</CardTitle>
            <hr className="h-1 bg-black w-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ul className="flex flex-col gap-5 ">
              {topicsProgress.map((topic, index) => (
                <li key={index} className="flex gap-5 place-content-between">
                  <topic.topicCategoryIcon />
                  <p>{topic.topicLevel}</p>
                  <p>{topic.topicCount}</p>
                  <hr />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Link href="/training">View All Topics</Link>
          </CardFooter>
        </Card>
      </div>
    </section >
  );
}
