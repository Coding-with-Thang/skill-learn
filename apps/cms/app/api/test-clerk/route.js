import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify Clerk environment variables are loaded
 * DELETE THIS FILE AFTER VERIFICATION
 */
export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY ? '***SET***' : '***NOT SET***'
  
  return NextResponse.json({
    publishableKey: publishableKey ? `${publishableKey.substring(0, 20)}...` : 'NOT SET',
    secretKey,
    hasPublishableKey: !!publishableKey,
    hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV,
  })
}
