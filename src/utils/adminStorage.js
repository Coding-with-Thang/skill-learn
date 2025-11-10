import admin from 'firebase-admin'

// Read service account info from env vars (same as upload route)
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, "\n")
}

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
            storageBucket,
        })
    } catch (e) {
        // If initialization fails, admin may already be initialized or config invalid
        console.warn('Firebase Admin init error:', e?.message || e)
    }
}

const storage = admin.storage()

export async function getSignedUrl(path, expiresDays = 7) {
    if (!path) return null
    if (!storage || !storage.bucket) {
        console.warn('Firebase storage not configured; cannot generate signed URL')
        return null
    }

    try {
        const bucket = storage.bucket()
        const fileRef = bucket.file(path)
        const expiresAt = Date.now() + expiresDays * 24 * 60 * 60 * 1000
        const [signedUrl] = await fileRef.getSignedUrl({ action: 'read', expires: expiresAt })
        return signedUrl
    } catch (err) {
        console.error('getSignedUrl error:', err?.message || err)
        return null
    }
}

export default { getSignedUrl }
