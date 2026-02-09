import { NextResponse } from "next/server";
import { requireAdminOrMediaAccess } from "@skill-learn/lib/utils/auth.js";
import admin from "firebase-admin";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (privateKey && privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey && storageBucket) {
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

/** GET /api/admin/media — list uploaded media for the current tenant only. */
export async function GET() {
  try {
    const authResult = await requireAdminOrMediaAccess();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { tenantId } = authResult;

    const storage = getStorage();
    if (!storage?.bucket) {
      throw new AppError(
        "Firebase Storage is not configured.",
        ErrorType.API,
        { status: 500 }
      );
    }

    const bucket = storage.bucket();
    const prefix = `tenants/${tenantId}/media/`;
    const [files] = await bucket.getFiles({ prefix });
    const { FILE_UPLOAD } = await import("@/config/constants");
    const expiresAt =
      Date.now() + FILE_UPLOAD.URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    const items = await Promise.all(
      files.map(async (fileRef) => {
        const [signedUrl] = await fileRef.getSignedUrl({
          action: "read",
          expires: expiresAt,
        });
        const path = fileRef.name;
        const name = path.replace(/^.*\//, "") || path;
        return { url: signedUrl, path, name };
      })
    );

    return successResponse({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
