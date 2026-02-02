"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@skill-learn/ui/components/chart";
import { BarChart3 } from "lucide-react";
import { learningAnalyticsChartConfig } from "./learningAnalyticsChartConfig.js";

/**
 * Shared vertical bar chart: exposure vs mastery by category.
 * Used by admin learning analytics and user analytics pages.
 *
 * @param {{ chartData: Array<{ category: string, avgExposure: number, avgMastery: number }>, description?: string }} props
 */
export function ExposureMasteryBarChart({ chartData, description }) {
  if (!chartData?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Exposure vs Mastery by Category
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={learningAnalyticsChartConfig}
          className="h-[300px]"
        >
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="category"
              width={70}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="avgExposure"
              fill="var(--color-avgExposure)"
              radius={4}
              name="Avg Exposure"
            />
            <Bar
              dataKey="avgMastery"
              fill="var(--color-avgMastery)"
              radius={4}
              name="Mastery %"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
