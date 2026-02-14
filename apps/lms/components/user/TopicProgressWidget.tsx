"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@skill-learn/ui/components/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Link from "next/link";

export default function TopicProgressWidget() {
  const data = [
    { name: 'Completed', value: 2 },
    { name: 'Remaining', value: 18 }, // Total 20
  ];
  const COLORS = ['#2563eb', '#e5e7eb']; // Blue-600, Gray-200

  return (
    <Card className="w-full h-full bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Topic Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-between">
        {/* Circular Chart */}
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] ?? "#888"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">2</span>
            <span className="text-xs text-gray-500">Completed</span>
          </div>
        </div>

        {/* Legend / Stats */}
        <div className="w-full space-y-3 mt-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-gray-600">Not Started</span>
            </div>
            <span className="font-semibold text-gray-900">18</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-gray-600">Beginner</span>
            </div>
            <span className="font-semibold text-gray-900">1</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Intermediate</span>
            </div>
            <span className="font-semibold text-gray-900">0</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Link href="/training">View All Topics</Link>
      </CardFooter>
    </Card>
  );
}
