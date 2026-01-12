"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { HelpCircle, Gamepad2, ArrowRight } from "lucide-react";
import { Progress } from "@skill-learn/ui/components/progress";

export default function DailyActivitiesWidget() {
  return (
    <Card className="w-full h-full bg-white rounded-3xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Today&apos;s Activities</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">

        {/* Daily Questions */}
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-900">Daily Questions</h3>
              <p className="text-sm text-gray-500">Earn points by answering daily questions.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Link href="/training" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10">
                <ArrowRight className="w-4 h-4 mr-2" /> Start Training
              </Button>
            </Link>
            <Link href="/games" className="flex-1">
              <Button variant="outline" className="w-full bg-white text-gray-700 border-gray-200 hover:bg-gray-100 rounded-xl h-10">
                <Gamepad2 className="w-4 h-4 mr-2" /> Play a Game
              </Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* More Training */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
              <div className="w-5 h-5 rounded-full border-2 border-current" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">More Training</h3>
              <p className="text-sm text-gray-500 mb-2">Recommendation: How to Create an Empathetic Client Experience</p>
              <Progress value={20} className="h-1.5 mb-1 bg-gray-200" indicatorClassName="bg-blue-600" />
              <p className="text-xs text-gray-400 text-right">3 of 20</p>
            </div>
            <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl px-6 h-10 shrink-0 self-center">
              Continue
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
