import {
  Users,
  Gift,
  Star,
  CheckCircle,
  BookOpen,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@skill-learn/ui/components/card";
import { LineChart } from "@skill-learn/ui/components/line-chart";
import { PieChart } from "@skill-learn/ui/components/pie-chart";
import { Progress } from "@skill-learn/ui/components/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@skill-learn/ui/components/avatar";
import { Button } from "@skill-learn/ui/components/button";
import { getDashboardStats } from "@/lib/actions/dashboard";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
    userActivity = [],
    pointsDistribution = [],
    categoryPerformance = [],
    recentActivity = []
  } = stats || {};

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="shadow-sm border-none bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-3xl font-bold mt-2">{totalUsers.value.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className={`w-4 h-4 ${totalUsers.trend >= 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
              <span className={`text-sm font-medium ${totalUsers.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(totalUsers.trend).toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">increase from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Rewards */}
        <Card className="shadow-sm border-none bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rewards</p>
                <h3 className="text-3xl font-bold mt-2">{activeRewards.value}</h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-muted-foreground">Active in global catalog</span>
            </div>
          </CardContent>
        </Card>

        {/* Points Awarded */}
        <Card className="shadow-sm border-none bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points Awarded</p>
                <h3 className="text-3xl font-bold mt-2">{totalPointsAwarded.value.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className={`w-4 h-4 ${totalPointsAwarded.trend >= 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
              <span className={`text-sm font-medium ${totalPointsAwarded.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(totalPointsAwarded.trend).toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">more than last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Claimed */}
        <Card className="shadow-sm border-none bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rewards Claimed</p>
                <h3 className="text-3xl font-bold mt-2">{rewardsClaimed.value}</h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-muted-foreground">Last claim 2m ago</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Activity - Takes up 2/3 */}
        <Card className="lg:col-span-2 shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>User Activity</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              Last 7 Days <ChevronDown className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pl-0">
            <LineChart data={userActivity} />
          </CardContent>
        </Card>

        {/* Points Distribution */}
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={pointsDistribution} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {Array.isArray(pointsDistribution) && pointsDistribution.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4] }}></div>
                  <span className="truncate text-muted-foreground">{item.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Category Performance</h2>
            <span className="text-sm text-muted-foreground">Course & Quiz Metrics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(categoryPerformance) && categoryPerformance.map((category) => (
              <Card key={category.category} className="shadow-sm border-none">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold truncate max-w-[120px] sm:max-w-none">{category.category}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${category.averageScore >= 80 ? 'bg-green-100 text-green-700' :
                      category.averageScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {category.averageScore >= 80 ? 'High Performing' : category.averageScore >= 50 ? 'Average' : 'Needs Attn.'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Combined Completion</span>
                      </div>
                      <Progress value={category.completionRate} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">Avg. Quiz Score</span>
                      <span className="text-lg font-bold">{category.averageScore.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Card className="shadow-sm border-none h-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Activity Log</CardTitle>
              <Link href="/dashboard/audit-logs" className="text-sm text-blue-600 hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.isArray(recentActivity) && recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-3 sm:gap-4 overflow-hidden">
                  <Avatar className="h-9 w-9 shrink-0">
                    {activity.userImage && <AvatarImage src={activity.userImage} alt={activity.user} />}
                    <AvatarFallback>{activity.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium leading-none truncate">{activity.user}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase">{activity.role}</p>
                    <p className="text-sm text-muted-foreground break-words line-clamp-2">{activity.action}</p>
                    <div className="pt-1">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">COMPLETE</span>
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
