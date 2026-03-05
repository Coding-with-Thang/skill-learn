"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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

type ByCategoryItem = { categoryId?: string; categoryName: string; cardCount?: number; userCount?: number; avgExposure?: number; avgMastery?: number };
type LearningAnalyticsData = { byCategory?: ByCategoryItem[]; totalCards?: number; totalUsers?: number; totalExposures?: number; avgMasteryOverall?: number };

export default function FlashCardsLearningAnalyticsPage() {
  const t = useTranslations("adminFlashcardsLearningAnalytics");
  const [data, setData] = useState<LearningAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/flashcards/learning-analytics")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setData(d as LearningAnalyticsData);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader variant="gif" />;

  const byCategory = data?.byCategory ?? [];
  const chartData = byCategory.map((c) => ({
    category: c.categoryName,
    avgExposure: Math.round((c.avgExposure ?? 0) * 10) / 10,
    avgMastery: Math.round((c.avgMastery ?? 0) * 100),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalCardsStudied")}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {data?.totalCards ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("activeUsers")}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              {data?.totalUsers ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalExposures")}</CardDescription>
            <CardTitle className="text-2xl">{data?.totalExposures ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("avgMastery")}</CardDescription>
            <CardTitle className="text-2xl">
              {((data?.avgMasteryOverall ?? 0) * 100).toFixed(0)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {chartData.length > 0 && (
        <ExposureMasteryBarChart
          chartData={chartData}
          description={t("chartDescription")}
        />
      )}

      {byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("byCategory")}</CardTitle>
            <CardDescription>{t("detailedMetrics")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("cards")}</TableHead>
                  <TableHead>{t("users")}</TableHead>
                  <TableHead>{t("avgExposure")}</TableHead>
                  <TableHead>{t("avgMasteryCol")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byCategory.map((c) => (
                  <TableRow key={c.categoryId}>
                    <TableCell>{c.categoryName}</TableCell>
                    <TableCell>{c.cardCount}</TableCell>
                    <TableCell>{c.userCount}</TableCell>
                    <TableCell>{(c.avgExposure ?? 0).toFixed(1)}</TableCell>
                    <TableCell>{((c.avgMastery ?? 0) * 100).toFixed(0)}%</TableCell>
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
            {t("noStudyData")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
