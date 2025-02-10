"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
export default function SignInPage() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ username: '', password: '' })

  const validateForm = () => {
    const newErrors = { username: '', password: '' }

    if (!username) {
      newErrors.username = 'Username is required'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)

    return !newErrors.username && !newErrors.password
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Logic to handle form submission (like calling API)
      console.log("success")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Hero Banner */}
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/hero-image.jpg')" }} />

      {/* Sign In Form */}
      <div className="w-1/2 flex justify-center items-center px-8 py-12 bg-white shadow-md">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-semibold text-center text-gray-800">Sign In</h2>

          {/* Username */}
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 p-3 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
            {errors.username && <p className="text-red-500 text-sm mt-2">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 p-3 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}