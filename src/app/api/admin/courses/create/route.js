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

        // For validation or other errors, return 400 with payload to surface details
        return NextResponse.json(result || { status: 'error', message: 'Failed to create course' }, { status: 400 });
    } catch (error) {
        console.error('[api/admin/courses/create] error:', error?.stack || error);
        return NextResponse.json({ status: 'error', message: error?.message || String(error) }, { status: 500 });
    }
}
