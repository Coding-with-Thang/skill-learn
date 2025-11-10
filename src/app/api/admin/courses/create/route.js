import { NextResponse } from 'next/server';
import { createCourse } from '../actions';

export async function POST(req) {
    try {
        const body = await req.json();
        console.log('[api/admin/courses/create] body:', JSON.stringify(body));

        // Forward to server action that performs validation and DB write
        const result = await createCourse(body);
        console.log('[api/admin/courses/create] createCourse result:', JSON.stringify(result));

        if (result?.status === 'success') {
            return NextResponse.json(result, { status: 200 });
        }

        // For validation or other errors, always return a predictable JSON shape
        const errorPayload = {
            status: result?.status || 'error',
            message: result?.message || 'Failed to create course',
            details: result?.details || null,
        };
        console.warn('[api/admin/courses/create] returning error payload:', JSON.stringify(errorPayload));
        return NextResponse.json(errorPayload, { status: 400 });
    } catch (error) {
        console.error('[api/admin/courses/create] error:', error?.stack || error);
        return NextResponse.json({ status: 'error', message: error?.message || String(error) }, { status: 500 });
    }
}
