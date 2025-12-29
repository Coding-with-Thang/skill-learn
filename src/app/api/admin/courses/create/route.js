import { NextResponse } from 'next/server';
import { createCourse } from '../actions';
import { handleApiError, AppError, ErrorType } from '@/utils/errorHandler';

export async function POST(req) {
    try {
        const body = await req.json();

        // Forward to server action that performs validation and DB write
        const result = await createCourse(body);

        if (result?.status === 'success') {
            return NextResponse.json(result, { status: 200 });
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
