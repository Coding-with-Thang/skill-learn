import { StatCard } from "@/components/ui/stat-card";
import { Users, Gift, Star, Check, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";
import { PieChart } from "@/components/ui/pie-chart";
import { ActivityLog } from "@/components/ui/activity-log";
import { getDashboardStats } from "@/lib/actions/dashboard";

export default async function DashboardPage() {
  const {
    totalUsers,
    activeRewards,
    totalPointsAwarded,
    rewardsClaimed,
    userActivity,
    pointsDistribution,
    categoryPerformance,
    recentActivity
  } = await getDashboardStats();

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers.value}
          icon={Users}
          trend={totalUsers.trend}
          description={`${Math.abs(totalUsers.trend).toFixed(1)}% ${totalUsers.trend >= 0 ? 'increase' : 'decrease'} from last month`}
        />
        <StatCard
          title="Active Rewards"
          value={activeRewards.value}
          icon={Gift}
          trend={activeRewards.trend}
          description={`${Math.abs(activeRewards.trend).toFixed(1)}% ${activeRewards.trend >= 0 ? 'increase' : 'decrease'} in redemptions`}
        />
        <StatCard
          title="Points Awarded"
          value={totalPointsAwarded.value.toLocaleString()}
          icon={Star}
          trend={totalPointsAwarded.trend}
          description={`${Math.abs(totalPointsAwarded.trend).toFixed(1)}% ${totalPointsAwarded.trend >= 0 ? 'more' : 'fewer'} points than last month`}
        />
        <StatCard
          title="Rewards Claimed"
          value={rewardsClaimed.value}
          icon={Check}
          trend={rewardsClaimed.trend}
          description={`${Math.abs(rewardsClaimed.trend).toFixed(1)}% ${rewardsClaimed.trend >= 0 ? 'more' : 'fewer'} claims than last month`}
        />
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={userActivity} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={pointsDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryPerformance.map((category) => (
              <div key={category.category} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{category.category}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Completion Rate: {category.completionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average Score: {category.averageScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLog items={recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
