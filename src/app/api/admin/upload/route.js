import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { z } from 'zod';

export const fileUploadSchema = z.object({
    fileName: z.string().min(1, { message: "Filename is required" }),
    contentType: z.string().min(1, { message: "Content type is required" }),
    size: z.number().min(1, { message: "Size is required" }),
    isImage: z.boolean(),
})

// Initialize firebase-admin with a service account JSON in env var
if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || null;
    if (!serviceAccount) {
        // Do not throw here; route will return a clear error if called without config
        console.warn('FIREBASE_SERVICE_ACCOUNT not set; uploads will fail until configured.');
    } else {
        try {
            const parsed = JSON.parse(serviceAccount);
            admin.initializeApp({
                credential: admin.credential.cert(parsed),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
        } catch (err) {
            console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err.message);
        }
    }
}
const storage = admin.storage?.();

export async function POST(req) {
    try {
        const formData = await req.formData();
        // Get the uploaded file from the form data
        const file = formData.get('file');
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Build a plain object with the metadata we expect and validate it with Zod
        const metadata = {
            fileName: file.name || '',
            contentType: file.type || '',
            size: typeof file.size === 'number' ? file.size : (file.size ? Number(file.size) : 0),
            isImage: typeof file.type === 'string' ? file.type.startsWith('image/') : false,
        };

        const validation = fileUploadSchema.safeParse(metadata);
        if (!validation.success) {
            // Return a helpful validation error payload
            const formatted = validation.error.flatten();
            return NextResponse.json({ error: 'Invalid file metadata', details: formatted }, { status: 400 });
        }

        // Use validated metadata for upload
        const { fileName: originalName, contentType } = validation.data;

        // Create buffer and upload to Firebase Storage via admin SDK
        if (!storage) {
            return NextResponse.json({ error: 'Firebase admin storage not configured' }, { status: 500 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const storageFileName = `uploads/${Date.now()}_${originalName}`;
        const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
        const fileUpload = bucket.file(storageFileName);

        await fileUpload.save(buffer, { metadata: { contentType } });

        // Make the file public URL or generate a signed URL. Prefer signed URL for private buckets
        const [url] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
    }
}