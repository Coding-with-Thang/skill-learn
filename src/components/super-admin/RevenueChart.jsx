"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const data30D = Array.from({ length: 30 }, (_, i) => ({
  name: `Oct ${i + 1}`,
  revenue: Math.floor(Math.random() * 50000) + 80000 + (i * 1000), // Random upward trend
  new: Math.floor(Math.random() * 10000) + 5000,
  churned: Math.floor(Math.random() * 2000) + 500,
}));

// Enhance data for smoother curve
const generateFormattedData = () => {
  return data30D.map(item => ({ ...item, revenue: item.revenue + Math.random() * 10000 }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        <p className="text-indigo-500 text-sm">MRR: ${payload[0].value.toLocaleString()}</p>
        <p className="text-emerald-500 text-sm">New: +${payload[1].value.toLocaleString()}</p>
        {payload[2] && <p className="text-rose-500 text-sm">Churn: -${payload[2].value.toLocaleString()}</p>}
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  const [period, setPeriod] = useState("30D");

  return (
    <Card className="col-span-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Revenue Overview</CardTitle>
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
          {["7D", "30D", "90D", "1Y"].map((t) => (
            <button
              key={t}
              onClick={() => setPeriod(t)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                period === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data30D} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366F1"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="new"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorNew)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
