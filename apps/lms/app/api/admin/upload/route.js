import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/utils/auth";
import admin from "firebase-admin";
import { z } from "zod";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});

// Initialize Firebase Admin SDK using service account credentials supplied via env vars.
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (privateKey && privateKey.includes("\\n")) {
  // when stored in .env the newlines are escaped; convert them back
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    // Do not throw here; we will surface an error at runtime if missing. But log for clarity.
    const missingVars = [];
    if (!projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKey) missingVars.push("FIREBASE_PRIVATE_KEY");
    if (!storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
    console.warn(
      `Firebase Admin SDK not fully configured. Missing environment variables: ${missingVars.join(
        ", "
      )}`
    );
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
    } catch (e) {
      // If initialization fails, admin may already be initialized or config invalid
      console.warn("Firebase Admin initialization error:", e?.message || e);
    }
  }
}

const getStorage = () => {
  if (!admin.apps.length) return null;
  try {
    return admin.storage();
  } catch (e) {
    return null;
  }
};

export async function POST(req) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    try {
      const ct = req.headers.get("content-type");
    } catch (e) {
      /* ignore header read errors */
    }
    const formData = await req.formData();
    // Get the uploaded file from the form data
    const file = formData.get("file");
    if (!file) {
      throw new AppError("No file uploaded", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Build a plain object with the metadata we expect and validate it with Zod
    const metadata = {
      fileName: file.name || "",
      contentType: file.type || "",
      size:
        typeof file.size === "number"
          ? file.size
          : file.size
          ? Number(file.size)
          : 0,
      isImage:
        typeof file.type === "string" ? file.type.startsWith("image/") : false,
    };

    const validation = fileUploadSchema.safeParse(metadata);
    if (!validation.success) {
      throw new AppError("Invalid file metadata", ErrorType.VALIDATION, {
        status: 400,
        details: validation.error.flatten(),
      });
    }

    // Use validated metadata for upload
    const { fileName: originalName, contentType } = validation.data;

    // Create buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const storage = getStorage();
    // Ensure bucket is available
    if (!storage || !storage.bucket) {
      const missingVars = [];
      if (!projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
      if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKey) missingVars.push("FIREBASE_PRIVATE_KEY");
      if (!storageBucket)
        missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");

      throw new AppError(
        missingVars.length > 0
          ? `Firebase Storage is not configured. Please set the following environment variables: ${missingVars.join(
              ", "
            )}`
          : "Firebase Storage is not configured on the server. Please check your Firebase configuration.",
        ErrorType.API,
        {
          status: 500,
        }
      );
    }

    const bucket = storage.bucket();
    const storageFileName = `courses/${Date.now()}_${originalName}`;
    const fileRef = bucket.file(storageFileName);

    // Upload the buffer
    await fileRef.save(buffer, {
      metadata: {
        contentType,
      },
      resumable: false,
    });

    // Make the file publicly readable (optional). Alternatively, create a signed URL.
    // Here we'll create a signed URL valid for the configured number of days.
    const { FILE_UPLOAD } = await import("@/config/constants");
    const expiresAt =
      Date.now() + FILE_UPLOAD.URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: expiresAt,
    });

    // Return the signed URL and the storage path so the client can delete the file later
    return successResponse({ url: signedUrl, path: storageFileName });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const { path } = body || {};
    if (!path) {
      throw new AppError(
        'Missing "path" in request body',
        ErrorType.VALIDATION,
        {
          status: 400,
        }
      );
    }

    const storage = getStorage();
    if (!storage || !storage.bucket) {
      const missingVars = [];
      if (!projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
      if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKey) missingVars.push("FIREBASE_PRIVATE_KEY");
      if (!storageBucket)
        missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");

      throw new AppError(
        missingVars.length > 0
          ? `Firebase Storage is not configured. Please set the following environment variables: ${missingVars.join(
              ", "
            )}`
          : "Firebase Storage is not configured on the server. Please check your Firebase configuration.",
        ErrorType.API,
        {
          status: 500,
        }
      );
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(path);

    // Attempt to delete the file. If the file does not exist, surface an informative error.
    await fileRef.delete();

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
