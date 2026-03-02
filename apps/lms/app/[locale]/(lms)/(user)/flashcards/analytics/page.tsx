"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Loader } from "@skill-learn/ui/components/loader";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import api from "@skill-learn/lib/utils/axios";
import { ExposureMasteryBarChart } from "@/components/flashcards/ExposureMasteryBarChart";

type AnalyticsData = { byCategory?: { categoryName?: string; avgExposure?: number; avgMastery?: number }[]; totalCards?: number; totalExposures?: number; avgMasteryOverall?: number };

export default function FlashCardsAnalyticsPage() {
  const t = useTranslations("flashcards");
  const tB = useTranslations("breadcrumbs");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/flashcards/analytics")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setData(d as AnalyticsData);
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
    <>
      <BreadCrumbCom
        crumbs={[
          { name: tB("flashCards"), href: "/flashcards" },
          { name: tB("myAnalytics"), href: "/flashcards/analytics" },
        ]}
        endtrail={tB("myAnalytics")}
      />
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("learningAnalytics")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("exposureAndMastery")}
          </p>
        </div>

        {(data?.totalCards ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>{t("noStudyDataYet")}</p>
              <p className="text-sm mt-1">
                {t("startStudyingToSee")}
              </p>
              <Link href="/flashcards" className="text-primary hover:underline mt-4 inline-block">
                {t("goToFlashCards")}
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{t("cardsStudied")}</CardDescription>
                  <CardTitle className="text-2xl">{data?.totalCards ?? 0}</CardTitle>
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
          </>
        )}

        <Link
          href="/flashcards"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          {t("backToFlashCardsLink")}
        </Link>
      </div>
    </>
  );
}
