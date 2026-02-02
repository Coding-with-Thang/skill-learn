/**
 * Shared chart config for flashcard learning analytics (exposure vs mastery).
 * Used by both admin learning analytics and user analytics pages.
 */
export const learningAnalyticsChartConfig = {
  avgExposure: {
    label: "Avg Exposure",
    color: "hsl(var(--chart-1))",
  },
  avgMastery: {
    label: "Mastery %",
    color: "hsl(var(--chart-2))",
  },
};
