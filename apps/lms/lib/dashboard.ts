import { prisma } from '@skill-learn/database';
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

export async function getDashboardStats() {
  try {
    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // Time periods for trend calculations
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    // Get total users count and trend (filtered by tenant)
    // Exclude only obvious test users (users with test/demo/temp/fake in username)
    // Count all other users regardless of activity
    const testUserPattern = /test|demo|temp|fake|^test_/i;

    // Fetch users for this tenant to filter out test users
    const allUsers = await prisma.user.findMany({
      where: {
        tenantId: tenantId, // Filter by tenant
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    // Filter out only test users (keep all real users even if inactive)
    const realUsers = allUsers.filter((user) => {
      // Exclude test users (case-insensitive check)
      return !testUserPattern.test(user.username);
    });

    const totalUsers = realUsers.length;

    // Filter for last month
    const lastMonthUsers = realUsers.filter((user) => {
      const userDate = new Date(user.createdAt);
      return userDate >= oneMonthAgo && userDate < today;
    }).length;

    // Filter for previous month
    const previousMonthUsers = realUsers.filter((user) => {
      const userDate = new Date(user.createdAt);
      return userDate >= twoMonthsAgo && userDate < oneMonthAgo;
    }).length;
    const usersTrend =
      previousMonthUsers > 0
        ? ((lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100
        : 0;

    // CRITICAL: Filter rewards by tenant or global content using standardized utility
    const rewardWhereClause = buildTenantContentFilter(tenantId, {
      enabled: true,
    });

    // Get active rewards count and trend (filtered by tenant)
    const activeRewards = await prisma.reward.count({
      where: rewardWhereClause,
    });

    // Calculate trend based on reward redemptions (more meaningful metric for activity)
    // Filter rewardLog by users in this tenant
    const lastMonthRedemptions = await prisma.rewardLog.count({
      where: {
        claimed: true,
        createdAt: {
          gte: oneMonthAgo,
          lt: today,
        },
        user: {
          tenantId: tenantId, // Filter by tenant
        },
      },
    });
    const previousMonthRedemptions = await prisma.rewardLog.count({
      where: {
        claimed: true,
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
        user: {
          tenantId: tenantId, // Filter by tenant
        },
      },
    });
    const rewardsTrend =
      previousMonthRedemptions > 0
        ? ((lastMonthRedemptions - previousMonthRedemptions) /
            previousMonthRedemptions) *
          100
        : 0;

    // Get total points awarded and trend (filtered by tenant)
    const pointsData = await prisma.pointLog.aggregate({
      where: {
        user: {
          tenantId: tenantId, // Filter by tenant
        },
      },
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
        user: {
          tenantId: tenantId, // Filter by tenant
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
        user: {
          tenantId: tenantId, // Filter by tenant
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

    // Get total rewards claimed and trend (filtered by tenant)
    const rewardsClaimed = await prisma.rewardLog.count({
      where: {
        claimed: true,
        user: {
          tenantId: tenantId, // Filter by tenant
        },
      },
    });
    const lastMonthClaimed = await prisma.rewardLog.count({
      where: {
        claimed: true,
        createdAt: {
          gte: oneMonthAgo,
          lt: today,
        },
        user: {
          tenantId: tenantId, // Filter by tenant
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
        user: {
          tenantId: tenantId, // Filter by tenant
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

    // Get points distribution by category with trends (filtered by tenant)
    const pointsDistribution = await prisma.pointLog.groupBy({
      by: ["reason"],
      _sum: {
        amount: true,
      },
      where: {
        user: {
          tenantId: tenantId, // Filter by tenant
        },
      },
    });

    // Map quiz IDs to quiz names for points distribution
    const quizIdPattern = /^(quiz_completed_|perfect_score_bonus_)(.+)$/;
    const quizIds = new Set();

    // Ensure pointsDistribution is an array before iterating
    if (Array.isArray(pointsDistribution)) {
      pointsDistribution.forEach((item) => {
        if (item?.reason) {
          const match = item.reason.match(quizIdPattern);
          if (match && match[2]) {
            quizIds.add(match[2]);
          }
        }
      });
    }

    // Fetch quiz names for all unique quiz IDs (filtered by tenant)
    const quizWhereClause = buildTenantContentFilter(tenantId, {
      id: { in: Array.from(quizIds) },
    });

    const quizzes = await prisma.quiz.findMany({
      where: quizWhereClause,
      select: {
        id: true,
        title: true,
      },
    });

    // Create a map of quiz ID to quiz name
    const quizNameMap = new Map();
    quizzes.forEach((quiz) => {
      quizNameMap.set(quiz.id, quiz.title);
    });

    // Aggregate quiz points by quiz ID (combine quiz_completed and perfect_score_bonus)
    const quizPointsMap = new Map();
    const nonQuizReasons: { category: string; points: number }[] = [];

    // Ensure pointsDistribution is an array before iterating
    if (Array.isArray(pointsDistribution)) {
      pointsDistribution.forEach((item) => {
        if (item?.reason) {
          const match = item.reason.match(quizIdPattern);
          if (match && match[2]) {
            const quizId = match[2];
            const currentPoints = quizPointsMap.get(quizId) || 0;
            quizPointsMap.set(quizId, currentPoints + (item._sum?.amount || 0));
          } else {
            // Non-quiz reasons (like points_spent_reward, etc.)
            nonQuizReasons.push({
              category: item.reason,
              points: item._sum?.amount || 0,
            });
          }
        }
      });
    }

    // Get category engagement trends (filtered by tenant)
    const categoryStats = await prisma.categoryStat.groupBy({
      by: ["categoryId"],
      _avg: {
        averageScore: true,
      },
      _sum: {
        attempts: true,
        completed: true,
      },
      where: {
        user: {
          tenantId: tenantId, // Filter by tenant
        },
      },
    });

    // Get recent activity with more context (filtered by tenant)
    const recentActivity = await prisma.auditLog.findMany({
      take: 5,
      orderBy: {
        timestamp: "desc",
      },
      where: {
        user: {
          tenantId: tenantId, // Filter by tenant
        },
      },
      include: {
        user: {
          select: {
            username: true,
            role: true,
            imageUrl: true,
          },
        },
      },
    });

    // CRITICAL: Filter categories by tenant or global content using standardized utility
    const categoryWhereClause = buildTenantContentFilter(tenantId);

    // Calculate completion rates for categories
    const categoryCompletionRates = Array.isArray(categoryStats) 
      ? await Promise.all(
          categoryStats.map(async (stat) => {
            // Filter category lookup by tenant
            const category = await prisma.category.findFirst({
              where: {
                ...categoryWhereClause,
                id: stat.categoryId,
              },
              select: { name: true },
            });
            return {
              categoryId: stat.categoryId,
              category: category?.name || "Unknown",
              completionRate:
                ((stat._sum.completed ?? 0) / (stat._sum.attempts || 1)) * 100,
              averageScore: stat._avg.averageScore || 0,
            };
          })
        )
      : [];

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
      userActivity: Array.isArray(userActivity) ? userActivity.map((item) => ({
        date: item.createdAt,
        activeUsers: item._count.userId,
      })) : [],
      pointsDistribution: [
        // Convert aggregated quiz points to distribution entries
        ...Array.from(quizPointsMap.entries()).map(([quizId, points]) => {
          const quizName = quizNameMap.get(quizId);
          return {
            category: quizName || `Quiz ${quizId}`,
            points: points,
          };
        }),
        // Add non-quiz reasons
        ...(Array.isArray(nonQuizReasons) ? nonQuizReasons : []),
      ],
      categoryPerformance: Array.isArray(categoryCompletionRates) ? categoryCompletionRates : [],
      recentActivity: Array.isArray(recentActivity) ? recentActivity.map((item) => ({
        id: item.id,
        user: item.user?.username || "Unknown",
        userImage: item.user?.imageUrl || null,
        role: item.user?.role || "UNKNOWN",
        action: item.action || "",
        timestamp: item.timestamp,
      })) : [],
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return safe defaults instead of throwing to prevent page crashes
    return {
      totalUsers: { value: 0, trend: 0 },
      activeRewards: { value: 0, trend: 0 },
      totalPointsAwarded: { value: 0, trend: 0 },
      rewardsClaimed: { value: 0, trend: 0 },
      userActivity: [],
      pointsDistribution: [],
      categoryPerformance: [],
      recentActivity: [],
    };
  }
}
