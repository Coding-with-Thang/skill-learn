"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export function LineChart({ data }) {
  // Format dates and ensure data is properly structured
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), "MMM d"),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
            cursor={{ stroke: '#0ea5e9', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="activeUsers"
            stroke="#0ea5e9"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorActiveUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 