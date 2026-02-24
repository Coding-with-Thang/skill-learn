import {
  Users,
  Gift,
  Star,
  CheckCircle,
  BookOpen,
  GraduationCap,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@skill-learn/ui/components/card";
import { LineChart } from "@skill-learn/ui/components/line-chart";
import { PieChart } from "@skill-learn/ui/components/pie-chart";
import { Progress } from "@skill-learn/ui/components/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@skill-learn/ui/components/avatar";
import { Button } from "@skill-learn/ui/components/button";
import { getDashboardStats } from "@/lib/dashboard";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import TenantSummary from "@/components/admin/TenantSummary";

export default async function DashboardPage() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    stats = null;
  }

  // Ensure all array fields are arrays (defensive programming)
  const {
    totalUsers = { value: 0, trend: 0 },
    activeRewards = { value: 0, trend: 0 },
    totalPointsAwarded = { value: 0, trend: 0 },
    rewardsClaimed = { value: 0, trend: 0 },
    courseUncompleted = { uncompletedPercentage: 0, uncompletedCount: 0, totalAssignments: 0 },
    quizUncompleted = { uncompletedPercentage: 0, uncompletedCount: 0, totalAssignments: 0 },
    userActivity = [],
    pointsDistribution = [],
    categoryPerformance = [],
    recentActivity = []
  } = stats || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Total Users */}
        <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Total Users</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{totalUsers.value.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-4xl group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-6">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${totalUsers.trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                <TrendingUp className={`w-3 h-3 ${totalUsers.trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(totalUsers.trend).toFixed(1)}%
              </div>
              <span className="text-[11px] text-muted-foreground ml-2 font-medium">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Rewards */}
        <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/30 transition-all group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Active Rewards</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{activeRewards.value}</h3>
              </div>
              <div className="p-3 bg-violet-500/10 rounded-4xl group-hover:scale-110 transition-transform duration-300">
                <Gift className="w-6 h-6 text-violet-500" />
              </div>
            </div>
            <div className="flex items-center mt-6">
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Global Catalog</span>
            </div>
          </CardContent>
        </Card>

        {/* Points Awarded */}
        <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-all group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Points Awarded</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{totalPointsAwarded.value.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-4xl group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="flex items-center mt-6">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${totalPointsAwarded.trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                <TrendingUp className={`w-3 h-3 ${totalPointsAwarded.trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(totalPointsAwarded.trend).toFixed(1)}%
              </div>
              <span className="text-[11px] text-muted-foreground ml-2 font-medium">Growth rate</span>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Claimed */}
        <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Rewards Claimed</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{rewardsClaimed.value}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-4xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-center mt-6">
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">Live: 2m ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Uncompleted Course Assignments */}
        <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Uncompleted Courses</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{courseUncompleted.uncompletedCount.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-4xl group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Uncompleted %</span>
                <span className="text-blue-600">{courseUncompleted.uncompletedPercentage}%</span>
              </div>
              <Progress
                value={courseUncompleted.uncompletedPercentage}
                className="h-2 rounded-full bg-muted/40"
                indicatorClassName="bg-blue-500"
              />
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span>{courseUncompleted.totalAssignments.toLocaleString()} assignments</span>
                <Link href="/dashboard/course-status" className="text-blue-600 hover:underline font-bold">
                  view more
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uncompleted Quiz Assignments */}
        <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Uncompleted Quizzes</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{quizUncompleted.uncompletedCount.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-4xl group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Uncompleted %</span>
                <span className="text-indigo-600">{quizUncompleted.uncompletedPercentage}%</span>
              </div>
              <Progress
                value={quizUncompleted.uncompletedPercentage}
                className="h-2 rounded-full bg-muted/40"
                indicatorClassName="bg-indigo-500"
              />
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span>{quizUncompleted.totalAssignments.toLocaleString()} assignments</span>
                <Link href="/dashboard/quiz-status" className="text-indigo-600 hover:underline font-bold">
                  view more
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Summary - Organization Overview */}
      <TenantSummary />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-none border border-border/50 bg-card/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">User Activity</CardTitle>
              <CardDescription>Daily engagement metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-xl gap-2 font-semibold">
              Last 7 Days <ChevronDown className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="h-[300px] w-full">
              <LineChart data={userActivity} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border border-border/50 bg-card/30 backdrop-blur-sm">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-lg font-bold">Points Distribution</CardTitle>
            <CardDescription>Usage across categories</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[200px] w-full">
              <PieChart data={pointsDistribution} />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {Array.isArray(pointsDistribution) && pointsDistribution.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 border border-border/20">
                  <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-background`} style={{ backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][index % 4] }}></div>
                  <span className="text-[11px] font-bold text-muted-foreground truncate">{item.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Category Performance</h2>
              <p className="text-sm text-muted-foreground">Course completion & scoring efficiency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(categoryPerformance) && categoryPerformance.map((category, index) => (
              <Card key={category.categoryId ?? `category-${index}`} className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                <div className={`h-1.5 w-full ${category.averageScore >= 80 ? 'bg-emerald-500' : category.averageScore >= 50 ? 'bg-amber-500' : 'bg-rose-500 opacity-50'}`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/5 rounded-4xl group-hover:bg-primary/10 transition-colors">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-base truncate tracking-tight">{category.category}</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Completion</span>
                        <span className="text-sm font-black text-primary">{Math.round(category.completionRate)}%</span>
                      </div>
                      <Progress value={category.completionRate} className="h-2 rounded-full bg-muted/50" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/30">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg. Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black">{category.averageScore.toFixed(0)}</span>
                        <span className="text-sm font-bold text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight">Activity</h2>
            <Link href="/dashboard/audit-logs" className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full">View Logs</Link>
          </div>
          <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              {Array.isArray(recentActivity) && recentActivity.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4 last:mb-0 group cursor-default">
                  {index !== recentActivity.length - 1 && (
                    <div className="absolute left-4.5 top-10 bottom-0 w-px bg-border group-last:hidden" />
                  )}
                  <Avatar className="h-10 w-10 shrink-0 border-2 border-background ring-4 ring-muted/20">
                    {activity.userImage && <AvatarImage src={activity.userImage} alt={activity.user} />}
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">{activity.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.user}</p>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap px-2 py-0.5 rounded-full bg-muted/50">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">{activity.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {activity.details || `${activity.action} ${activity.resource || ""}`.trim()}
                    </p>
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <span className={`
                        px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase
                        ${activity.action === 'create' ? 'bg-emerald-500/10 text-emerald-600' :
                          activity.action === 'update' ? 'bg-amber-500/10 text-amber-600' :
                            activity.action === 'delete' ? 'bg-rose-500/10 text-rose-600' :
                              activity.action === 'attempt_started' ? 'bg-sky-500/10 text-sky-600' :
                                activity.action === 'attempt_completed' ? 'bg-indigo-500/10 text-indigo-600' :
                              'bg-muted text-muted-foreground'}
                      `}>
                        {String(activity.action || "event").replaceAll("_", " ").toUpperCase()}
                      </span>
                      {activity.resource ? (
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase">
                          {String(activity.resource).replaceAll("_", " ")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
