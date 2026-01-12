"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Enterprise", value: 35, color: "#8B5CF6" }, // Purple
  { name: "Professional", value: 105, color: "#3B82F6" }, // Blue
  { name: "Starter", value: 82, color: "#10B981" }, // Green
  { name: "Trial", value: 12, color: "#F59E0B" }, // Orange
];

const COLORS = data.map(d => d.color);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2 rounded shadow-lg text-sm">
        <span className="font-semibold" style={{ color: payload[0].payload.color }}>
          {payload[0].name}
        </span>
        : {payload[0].value} tenants
      </div>
    );
  }
  return null;
};

const renderLegend = ((props) => {
  const { payload } = props;
  return (
    <ul className="grid grid-cols-2 gap-2 text-xs mt-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.value}</span>
          <span className="font-semibold">{Math.round((data[index].value / 234) * 100)}%</span>
        </li>
      ))}
    </ul>
  );
});

export function SubscriptionChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Subscription Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} verticalAlign="bottom" height={50} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-6 text-center">
            <div className="text-3xl font-bold">234</div>
            <div className="text-xs text-muted-foreground">Total Tenants</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
