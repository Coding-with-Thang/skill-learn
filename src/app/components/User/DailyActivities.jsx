"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from 'lucide-react';
import { Play } from 'lucide-react';

export default function DailyActivities() {
  return (
    <section className="w-[50%] flex flex-col gap-4 bg-gray-50 border border-t-8 my-9 pl-4">
      <h1 className="text-3xl mt-3">Today's Activities</h1>
      <div className="flex gap-3 items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-green-500">
          <RefreshCcw width={24} height="24" className="text-gray-50 text-4xl" />
        </div>
        <h2 className="text-2xl text-gray-900">Daily Questions</h2>
      </div>
      <div className="flex gap-5">
        <p>Earnable 100 reward points remaining today! (No Daily Cap Set Yet)</p>
      </div>

      <Button className="bg-blue-900 text-gray-50 w-48 text-lg mb-4 hover:cursor-pointer">
        <Link href="/training" className="flex gap-2 justify-center items-center"><Play />Start Training</Link>
      </Button>

      <Button className="bg-blue-900 text-gray-50 w-48 text-lg mb-4 hover:cursor-pointer">
        <Link href="/games" className="flex gap-2 justify-center items-center"><Play />Play A Game</Link>
      </Button>

    </section>
  );
}
