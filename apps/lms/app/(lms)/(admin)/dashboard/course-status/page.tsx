import Link from "next/link";
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
  const { summary, rows } = await getCourseStatusReport();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Status by User</h1>
          <p className="text-sm text-muted-foreground">
            All tenant users against all published tenant/global courses.
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-none border border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Total assignments</CardDescription>
            <CardTitle className="text-2xl">{summary.totalAssignments.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-none border border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Uncompleted</CardDescription>
            <CardTitle className="text-2xl">{summary.uncompletedCount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-none border border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Uncompleted percentage</CardDescription>
            <CardTitle className="text-2xl">{summary.uncompletedPercentage}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-none border border-border/50">
        <CardHeader>
          <CardTitle>All course statuses per user</CardTitle>
          <CardDescription>
            {rows.length.toLocaleString()} rows ({summary.totalUsers} users × {summary.totalItems} courses)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Lessons</TableHead>
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
                      No course status records available for this tenant.
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
