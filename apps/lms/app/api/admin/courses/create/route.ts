import { NextRequest, NextResponse } from 'next/server';
import { createCourse } from '../actions';
import { getTenantContext } from "@skill-learn/lib/utils/tenant";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

export async function POST(req: NextRequest) {
    try {
        const context = await getTenantContext();
        if (context instanceof Response) {
            return context;
        }
        const { user, tenantId } = context;
        const permResult = await requirePermission(PERMISSIONS.COURSES_CREATE, tenantId);
        if (permResult instanceof NextResponse) {
            return permResult;
        }

        const body = await req.json();

        // Forward to server action that performs validation and DB write
        const result = await createCourse(body, user.id, tenantId);

        if (result?.status === 'success') {
            return successResponse(result);
        }

        // For validation or other errors, throw AppError
        throw new AppError(
            result?.message || 'Failed to create course',
            ErrorType.VALIDATION,
            { status: 400, details: result?.details }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
