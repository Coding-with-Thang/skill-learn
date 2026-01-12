"use client";

import { ArrowUpRight, ArrowDownRight, DollarSign, Building, Users, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const data = [
  { value: 400 }, { value: 300 }, { value: 550 }, { value: 450 },
  { value: 600 }, { value: 500 }, { value: 700 }, { value: 800 },
];

const data2 = [
  { value: 200 }, { value: 400 }, { value: 300 }, { value: 500 },
  { value: 450 }, { value: 600 }, { value: 550 }, { value: 650 },
];

const data3 = [
  { value: 300 }, { value: 250 }, { value: 400 }, { value: 350 },
  { value: 500 }, { value: 450 }, { value: 600 }, { value: 750 },
];

const data4 = [
  { value: 98 }, { value: 99 }, { value: 98 }, { value: 99 },
  { value: 99.5 }, { value: 99.2 }, { value: 99.8 }, { value: 99.9 },
];

const StatCard = ({ title, value, trend, trendUp, icon: Icon, chartData, color }) => {
  return (
    <Card className="hover-lift overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
            <Icon className={`w-5 h-5 ${color.replace("bg-", "text-")}`} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>

        <div className="h-12 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={trendUp ? "#10B981" : "#F43F5E"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export function HeroStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue (MRR)"
        value="$127,450"
        trend="+12%"
        trendUp={true}
        icon={DollarSign}
        chartData={data}
        color="bg-indigo-500"
      />
      <StatCard
        title="Active Tenants"
        value="234"
        trend="+8%"
        trendUp={true}
        icon={Building}
        chartData={data2}
        color="bg-blue-500"
      />
      <StatCard
        title="Total Users"
        value="12,847"
        trend="+15%"
        trendUp={true}
        icon={Users}
        chartData={data3}
        color="bg-purple-500"
      />
      <StatCard
        title="System Uptime"
        value="99.98%"
        trend="Healthy"
        trendUp={true}
        icon={Activity}
        chartData={data4}
        color="bg-emerald-500"
      />
    </div>
  );
}
