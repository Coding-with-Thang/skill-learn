export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users />}
          trend={+12}
        />
        <StatCard
          title="Active Rewards"
          value={activeRewards}
          icon={<Gift />}
          trend={+3}
        />
        <StatCard
          title="Points Awarded"
          value={totalPointsAwarded}
          icon={<Star />}
          trend={+2500}
        />
        <StatCard
          title="Rewards Claimed"
          value={rewardsClaimed}
          icon={<Check />}
          trend={+8}
        />
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={userActivityData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={pointsDistributionData} />
          </CardContent>
        </Card>
      </div>

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
