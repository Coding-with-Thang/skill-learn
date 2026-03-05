import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@skill-learn/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table";
import { Button } from "@skill-learn/ui/components/button";
import { getCourseStatusReport } from "@/lib/dashboard";
import { getTranslations } from "next-intl/server";

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-600";
    case "in-progress":
      return "bg-amber-500/10 text-amber-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function statusLabel(status: string) {
  return status.replaceAll("-", " ");
}

export default async function CourseStatusPage() {
  const t = await getTranslations("courseStatus");
  const { summary, rows } = await getCourseStatusReport();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link href="/dashboard">{t("backToDashboard")}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-none border border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>{t("totalAssignments")}</CardDescription>
            <CardTitle className="text-2xl">{summary.totalAssignments.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-none border border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>{t("uncompleted")}</CardDescription>
            <CardTitle className="text-2xl">{summary.uncompletedCount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-none border border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>{t("uncompletedPercentage")}</CardDescription>
            <CardTitle className="text-2xl">{summary.uncompletedPercentage}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-none border border-border/50">
        <CardHeader>
          <CardTitle>{t("allStatuses")}</CardTitle>
          <CardDescription>
            {t("rowsSummary", {
              rows: rows.length.toLocaleString(),
              users: summary.totalUsers.toString(),
              courses: summary.totalItems.toString(),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("course")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("progress")}</TableHead>
                  <TableHead>{t("lessons")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <TableRow key={`${row.userId}-${row.courseId}`}>
                      <TableCell className="font-medium">{row.userName}</TableCell>
                      <TableCell>{row.courseTitle}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(row.status)}`}>
                          {statusLabel(row.status)}
                        </span>
                      </TableCell>
                      <TableCell>{row.progressPercent}%</TableCell>
                      <TableCell>
                        {row.totalLessons > 0 ? `${row.completedLessons}/${row.totalLessons}` : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      {t("noRecords")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
