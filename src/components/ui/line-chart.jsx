"use client";

import {
  LineChart as RechartsLineChart,
  Line,
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
        <RechartsLineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
} 