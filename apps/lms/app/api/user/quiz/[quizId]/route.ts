import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { getLocaleFromRequest } from "@/lib/localeFromRequest";
import { localizeQuiz, localizeCategory } from "@/lib/localize";
import type { RouteContext } from "@/types";

type QuizIdParams = { quizId: string };

/**
 * GET /api/user/quiz/:quizId
 * Fetches a quiz with all questions and options for authenticated users.
 * Pass ?locale=fr or x-locale header for localized title/description.
 */
export async function GET(
  req: NextRequest,
  { params }: RouteContext<QuizIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { quizId } = await params;
    if (!quizId) {
      throw new AppError("Quiz ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter quiz by tenant or global content
    const whereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const locale = getLocaleFromRequest(req);

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        ...whereClause,
      },
      include: {
        category: true,
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const localized = localizeQuiz(quiz, locale);
    if (localized.category) {
      localized.category = localizeCategory(localized.category, locale);
    }
    return successResponse({ quiz: localized });
  } catch (error) {
    return handleApiError(error);
  }
}
