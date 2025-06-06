"use client"

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex bg-gray-100">
      {/* Hero Banner */}
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/hero-image.jpg')" }} />

      {/* Sign In Form */}
      <div className="w-1/2 flex justify-center items-center px-8 py-12 bg-white shadow-md">
        <SignUp />
      </div>
    </div>
  )
}