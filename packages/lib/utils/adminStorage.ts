import admin from 'firebase-admin'

// Read service account info from env vars (same as upload route)
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, "\n")
}

let storage: ReturnType<typeof admin.storage> | null = null

if (!admin.apps.length) {
    try {
        // firebase-admin expects keys using snake_case: project_id, client_email, private_key
        const serviceAccount = {
            project_id: projectId,
            client_email: clientEmail,
            private_key: privateKey,
        }

        // Only initialize if we have the required service account values (firebase-admin expects camelCase)
        if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key && storageBucket) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: serviceAccount.project_id,
                    clientEmail: serviceAccount.client_email,
                    privateKey: serviceAccount.private_key,
                }),
                storageBucket,
            })
            storage = admin.storage()
        } else {
            const missingVars: string[] = []
            if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
            if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL')
            if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY')
            if (!storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')
            console.warn(`Firebase Admin init skipped: missing environment variables: ${missingVars.join(', ')}`)
        }
    } catch (e) {
        // If initialization fails, admin may already be initialized or config invalid
        console.warn('Firebase Admin init error:', e instanceof Error ? e.message : e)
    }
} else {
    try {
        storage = admin.storage()
    } catch (e) {
        console.warn('Firebase Admin storage access error:', e instanceof Error ? e.message : e)
    }
}

export async function getSignedUrl(path, expiresDays = 7) {
    if (!path) return null
    if (!storage || !storage.bucket) {
        const missingVars: string[] = []
        if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
        if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL')
        if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY')
        if (!storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')
        const message = missingVars.length > 0
            ? `Firebase storage not configured; cannot generate signed URL. Missing environment variables: ${missingVars.join(', ')}`
            : 'Firebase storage not configured; cannot generate signed URL'
        console.warn(message)
        return null
    }

    try {
        const bucket = storage.bucket()
        const fileRef = bucket.file(path)
        const expiresAt = Date.now() + expiresDays * 24 * 60 * 60 * 1000
        const [signedUrl] = await fileRef.getSignedUrl({ action: 'read', expires: expiresAt })
        return signedUrl
    } catch (err) {
        console.error('getSignedUrl error:', err instanceof Error ? err.message : err)
        return null
    }
}
