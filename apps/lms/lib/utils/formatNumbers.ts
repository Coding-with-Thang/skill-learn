/**
 * Format a number with locale-aware grouping (e.g. 1,234.56).
 * Used for points, counts, and other numeric display.
 */
export default function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "0";
  return new Intl.NumberFormat().format(value);
}
