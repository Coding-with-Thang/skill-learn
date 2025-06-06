import prisma from "@/utils/connect";

export async function getDashboardStats() {
  try {
    // Time periods for trend calculations
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    // Get total users count and trend
    const totalUsers = await prisma.user.count();
    const lastMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
          lt: today,
        },
      },
    });
    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
    });
    const usersTrend =
      previousMonthUsers > 0
        ? ((lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100
        : 0;

    // Get active rewards count and trend
    const activeRewards = await prisma.reward.count({
      where: {
        enabled: true,
      },
    });
    const lastMonthRewards = await prisma.rewardLog.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
          lt: today,
        },
      },
    });
    const previousMonthRewards = await prisma.rewardLog.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
    });
    const rewardsTrend =
      previousMonthRewards > 0
        ? ((lastMonthRewards - previousMonthRewards) / previousMonthRewards) *
          100
        : 0;

    // Get total points awarded and trend
    const pointsData = await prisma.pointLog.aggregate({
      _sum: {
        amount: true,
      },
    });
    const lastMonthPoints = await prisma.pointLog.aggregate({
      where: {
        createdAt: {
          gte: oneMonthAgo,
          lt: today,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const previousMonthPoints = await prisma.pointLog.aggregate({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const totalPointsAwarded = pointsData._sum.amount || 0;
    const pointsTrend =
      (previousMonthPoints._sum.amount || 0) > 0
        ? (((lastMonthPoints._sum.amount || 0) -
            (previousMonthPoints._sum.amount || 0)) /
            (previousMonthPoints._sum.amount || 1)) *
          100
        : 0;

    // Get total rewards claimed and trend
    const rewardsClaimed = await prisma.rewardLog.count({
      where: {
        claimed: true,
      },
    });
    const lastMonthClaimed = await prisma.rewardLog.count({
      where: {
        claimed: true,
        createdAt: {
          gte: oneMonthAgo,
          lt: today,
        },
      },
    });
    const previousMonthClaimed = await prisma.rewardLog.count({
      where: {
        claimed: true,
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
    });
    const claimedTrend =
      previousMonthClaimed > 0
        ? ((lastMonthClaimed - previousMonthClaimed) / previousMonthClaimed) *
          100
        : 0;

    // Get user activity data for the last 6 months
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const userActivity = await prisma.pointLog.groupBy({
      by: ["createdAt"],
      _count: {
        userId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
    });

    // Get points distribution by category with trends
    const pointsDistribution = await prisma.pointLog.groupBy({
      by: ["reason"],
      _sum: {
        amount: true,
      },
    });

    // Get category engagement trends
    const categoryStats = await prisma.categoryStat.groupBy({
      by: ["categoryId"],
      _avg: {
        averageScore: true,
      },
      _sum: {
        attempts: true,
        completed: true,
      },
    });

    // Get recent activity with more context
    const recentActivity = await prisma.auditLog.findMany({
      take: 5,
      orderBy: {
        timestamp: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    // Calculate completion rates for categories
    const categoryCompletionRates = await Promise.all(
      categoryStats.map(async (stat) => {
        const category = await prisma.category.findUnique({
          where: { id: stat.categoryId },
          select: { name: true },
        });
        return {
          category: category?.name || "Unknown",
          completionRate:
            (stat._sum.completed / (stat._sum.attempts || 1)) * 100,
          averageScore: stat._avg.averageScore || 0,
        };
      })
    );

    return {
      totalUsers: {
        value: totalUsers,
        trend: usersTrend,
      },
      activeRewards: {
        value: activeRewards,
        trend: rewardsTrend,
      },
      totalPointsAwarded: {
        value: totalPointsAwarded,
        trend: pointsTrend,
      },
      rewardsClaimed: {
        value: rewardsClaimed,
        trend: claimedTrend,
      },
      userActivity: userActivity.map((item) => ({
        date: item.createdAt,
        activeUsers: item._count.userId,
      })),
      pointsDistribution: pointsDistribution.map((item) => ({
        category: item.reason,
        points: item._sum.amount,
      })),
      categoryPerformance: categoryCompletionRates,
      recentActivity: recentActivity.map((item) => ({
        id: item.id,
        user: item.user.username,
        role: item.user.role,
        action: item.action,
        timestamp: item.timestamp,
      })),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}
