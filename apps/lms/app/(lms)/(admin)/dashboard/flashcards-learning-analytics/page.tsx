"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table";
import { Loader } from "@skill-learn/ui/components/loader";
import { Users, BookOpen } from "lucide-react";
import api from "@skill-learn/lib/utils/axios";
import { ExposureMasteryBarChart } from "@/components/flashcards/ExposureMasteryBarChart";

export default function FlashCardsLearningAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/flashcards/learning-analytics")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setData(d);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader variant="gif" />;

  const byCategory = data?.byCategory ?? [];
  const chartData = byCategory.map((c) => ({
    category: c.categoryName,
    avgExposure: Math.round(c.avgExposure * 10) / 10,
    avgMastery: Math.round(c.avgMastery * 100),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Learning Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Aggregate exposure and mastery per category.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total cards studied</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {data?.totalCards ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active users</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              {data?.totalUsers ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total exposures</CardDescription>
            <CardTitle className="text-2xl">{data?.totalExposures ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg mastery</CardDescription>
            <CardTitle className="text-2xl">
              {((data?.avgMasteryOverall ?? 0) * 100).toFixed(0)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {chartData.length > 0 && (
        <ExposureMasteryBarChart
          chartData={chartData}
          description="Aggregate across all users in tenant"
        />
      )}

      {byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
            <CardDescription>Detailed metrics per category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Cards</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Avg Exposure</TableHead>
                  <TableHead>Avg Mastery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byCategory.map((c) => (
                  <TableRow key={c.categoryId}>
                    <TableCell>{c.categoryName}</TableCell>
                    <TableCell>{c.cardCount}</TableCell>
                    <TableCell>{c.userCount}</TableCell>
                    <TableCell>{c.avgExposure.toFixed(1)}</TableCell>
                    <TableCell>{(c.avgMastery * 100).toFixed(0)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(data?.totalCards ?? 0) === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No study data yet. Users need to study flash cards to see analytics.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
