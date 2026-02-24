import { prisma } from '@skill-learn/database';
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

type StatusValue = "completed" | "in-progress" | "not-started";

type CourseStatusRow = {
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  status: StatusValue;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  completedAt: Date | null;
};

type QuizStatusRow = {
  userId: string;
  userName: string;
  quizId: string;
  quizTitle: string;
  status: StatusValue;
  attempts: number;
  completedAttempts: number;
  passedAttempts: number;
  averageScore: number | null;
  bestScore: number | null;
  lastAttemptAt: Date | null;
};

type CompletionSummary = {
  totalUsers: number;
  totalItems: number;
  totalAssignments: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  uncompletedCount: number;
  uncompletedPercentage: number;
};

function getUserDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.username || "Unknown User";
}

function pairKey(userId: string, itemId: string) {
  return `${userId}:${itemId}`;
}

function buildSummary(
  totalUsers: number,
  totalItems: number,
  completedCount: number,
  inProgressCount: number,
  notStartedCount: number
): CompletionSummary {
  const totalAssignments = totalUsers * totalItems;
  const uncompletedCount = inProgressCount + notStartedCount;
  const uncompletedPercentage =
    totalAssignments > 0
      ? Number(((uncompletedCount / totalAssignments) * 100).toFixed(1))
      : 0;

  return {
    totalUsers,
    totalItems,
    totalAssignments,
    completedCount,
    inProgressCount,
    notStartedCount,
    uncompletedCount,
    uncompletedPercentage,
  };
}

export async function getCourseStatusReport() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return {
      summary: buildSummary(0, 0, 0, 0, 0),
      rows: [] as CourseStatusRow[],
    };
  }

  const [users, courses] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { username: "asc" }],
    }),
    prisma.course.findMany({
      where: buildTenantContentFilter(tenantId, {
        status: "Published",
      }),
      select: {
        id: true,
        title: true,
        chapters: {
          select: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const userIds = users.map((user) => user.id);
  const courseIds = courses.map((course) => course.id);

  if (userIds.length === 0 || courseIds.length === 0) {
    return {
      summary: buildSummary(users.length, courses.length, 0, 0, users.length * courses.length),
      rows: [] as CourseStatusRow[],
    };
  }

  const lessonIdToCourseId = new Map<string, string>();
  const courseTotalLessons = new Map<string, number>();

  for (const course of courses) {
    let totalLessons = 0;
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        lessonIdToCourseId.set(lesson.id, course.id);
        totalLessons += 1;
      }
    }
    courseTotalLessons.set(course.id, totalLessons);
  }

  const allLessonIds = Array.from(lessonIdToCourseId.keys());

  const [courseProgress, lessonProgress] = await Promise.all([
    prisma.courseProgress.findMany({
      where: {
        userId: { in: userIds },
        courseId: { in: courseIds },
      },
      select: {
        userId: true,
        courseId: true,
        completedAt: true,
      },
    }),
    allLessonIds.length > 0
      ? prisma.lessonProgress.findMany({
          where: {
            userId: { in: userIds },
            lessonId: { in: allLessonIds },
          },
          select: {
            userId: true,
            lessonId: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const completedCourseKeys = new Set<string>();
  const inProgressCourseKeys = new Set<string>();
  const completedAtByKey = new Map<string, Date | null>();
  const completedLessonsByKey = new Map<string, number>();

  for (const row of courseProgress) {
    const key = pairKey(row.userId, row.courseId);
    if (row.completedAt) {
      completedCourseKeys.add(key);
      completedAtByKey.set(key, row.completedAt);
    } else {
      inProgressCourseKeys.add(key);
    }
  }

  for (const row of lessonProgress) {
    const courseId = lessonIdToCourseId.get(row.lessonId);
    if (!courseId) continue;
    const key = pairKey(row.userId, courseId);
    completedLessonsByKey.set(key, (completedLessonsByKey.get(key) ?? 0) + 1);
    inProgressCourseKeys.add(key);
  }

  const rows: CourseStatusRow[] = [];
  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;

  for (const user of users) {
    for (const course of courses) {
      const key = pairKey(user.id, course.id);
      const totalLessons = courseTotalLessons.get(course.id) ?? 0;
      const completedLessons = completedLessonsByKey.get(key) ?? 0;
      const completedAt = completedAtByKey.get(key) ?? null;
      let status: StatusValue = "not-started";

      if (completedCourseKeys.has(key)) {
        status = "completed";
        completedCount += 1;
      } else if (inProgressCourseKeys.has(key)) {
        status = "in-progress";
        inProgressCount += 1;
      } else {
        notStartedCount += 1;
      }

      const progressPercent =
        status === "completed"
          ? 100
          : totalLessons > 0
            ? Math.min(99, Math.round((completedLessons / totalLessons) * 100))
            : 0;

      rows.push({
        userId: user.id,
        userName: getUserDisplayName(user),
        courseId: course.id,
        courseTitle: course.title,
        status,
        progressPercent,
        completedLessons,
        totalLessons,
        completedAt,
      });
    }
  }

  return {
    summary: buildSummary(
      users.length,
      courses.length,
      completedCount,
      inProgressCount,
      notStartedCount
    ),
    rows,
  };
}

export async function getQuizStatusReport() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return {
      summary: buildSummary(0, 0, 0, 0, 0),
      rows: [] as QuizStatusRow[],
    };
  }

  const [users, quizzes] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { username: "asc" }],
    }),
    prisma.quiz.findMany({
      where: buildTenantContentFilter(tenantId, {
        isActive: true,
      }),
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const userIds = users.map((user) => user.id);
  const quizIds = quizzes.map((quiz) => quiz.id);

  if (userIds.length === 0 || quizIds.length === 0) {
    return {
      summary: buildSummary(users.length, quizzes.length, 0, 0, users.length * quizzes.length),
      rows: [] as QuizStatusRow[],
    };
  }

  const quizProgress = await prisma.quizProgress.findMany({
    where: {
      userId: { in: userIds },
      quizId: { in: quizIds },
    },
    select: {
      userId: true,
      quizId: true,
      attempts: true,
      completedAttempts: true,
      passedAttempts: true,
      averageScore: true,
      bestScore: true,
      lastAttemptAt: true,
    },
  });

  const progressByKey = new Map<string, (typeof quizProgress)[number]>();
  for (const row of quizProgress) {
    progressByKey.set(pairKey(row.userId, row.quizId), row);
  }

  const rows: QuizStatusRow[] = [];
  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;

  for (const user of users) {
    for (const quiz of quizzes) {
      const progress = progressByKey.get(pairKey(user.id, quiz.id));
      const attempts = progress?.attempts ?? 0;
      const completedAttempts = progress?.completedAttempts ?? 0;
      const passedAttempts = progress?.passedAttempts ?? 0;
      const averageScore = progress?.averageScore ?? null;
      const bestScore = progress?.bestScore ?? null;
      const lastAttemptAt = progress?.lastAttemptAt ?? null;

      let status: StatusValue = "not-started";
      if (passedAttempts > 0) {
        status = "completed";
        completedCount += 1;
      } else if (attempts > 0) {
        status = "in-progress";
        inProgressCount += 1;
      } else {
        notStartedCount += 1;
      }

      rows.push({
        userId: user.id,
        userName: getUserDisplayName(user),
        quizId: quiz.id,
        quizTitle: quiz.title,
        status,
        attempts,
        completedAttempts,
        passedAttempts,
        averageScore,
        bestScore,
        lastAttemptAt,
      });
    }
  }

  return {
    summary: buildSummary(
      users.length,
      quizzes.length,
      completedCount,
      inProgressCount,
      notStartedCount
    ),
    rows,
  };
}

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
    const categoryStats = await prisma.quizProgress.groupBy({
      by: ["categoryId"],
      _avg: {
        averageScore: true,
      },
      _sum: {
        attempts: true,
        completedAttempts: true,
        passedAttempts: true,
      },
      where: {
        user: {
          tenantId: tenantId,
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
                ((stat._sum.completedAttempts ?? 0) / (stat._sum.attempts || 1)) *
                100,
              averageScore: stat._avg.averageScore || 0,
            };
          })
        )
      : [];

    const [courseStatusReport, quizStatusReport] = await Promise.all([
      getCourseStatusReport(),
      getQuizStatusReport(),
    ]);

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
      courseUncompleted: {
        uncompletedPercentage: courseStatusReport.summary.uncompletedPercentage,
        uncompletedCount: courseStatusReport.summary.uncompletedCount,
        totalAssignments: courseStatusReport.summary.totalAssignments,
      },
      quizUncompleted: {
        uncompletedPercentage: quizStatusReport.summary.uncompletedPercentage,
        uncompletedCount: quizStatusReport.summary.uncompletedCount,
        totalAssignments: quizStatusReport.summary.totalAssignments,
      },
      categoryPerformance: Array.isArray(categoryCompletionRates) ? categoryCompletionRates : [],
      recentActivity: Array.isArray(recentActivity) ? recentActivity.map((item) => ({
        id: item.id,
        user: item.user?.username || "Unknown",
        userImage: item.user?.imageUrl || null,
        role: item.user?.role || "UNKNOWN",
        action: item.action || "",
        resource: item.resource || "",
        details: item.details || "",
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
      courseUncompleted: { uncompletedPercentage: 0, uncompletedCount: 0, totalAssignments: 0 },
      quizUncompleted: { uncompletedPercentage: 0, uncompletedCount: 0, totalAssignments: 0 },
      categoryPerformance: [],
      recentActivity: [],
    };
  }
}
