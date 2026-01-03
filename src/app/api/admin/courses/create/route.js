import { NextResponse } from 'next/server';
import { createCourse } from '../actions';
import { requireAdmin } from '@/lib/utils/auth';
import { handleApiError, AppError, ErrorType } from '@/lib/utils/errorHandler';
import { successResponse } from '@/lib/utils/apiWrapper';

export async function POST(req) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }
        const { user } = adminResult;

        const body = await req.json();

        // Forward to server action that performs validation and DB write
        const result = await createCourse(body, user.id);

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
