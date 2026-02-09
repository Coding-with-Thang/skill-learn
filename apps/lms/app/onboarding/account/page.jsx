"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, useSignUp, useSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@skill-learn/ui/components/card";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import { toast } from "sonner";
import Link from "next/link";

export default function OnboardingAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const { isSignedIn, user, isLoaded: userLoaded } = useUser();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  const [mode, setMode] = useState("signup"); // signup, signin, verify
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // If user is already signed in, redirect to workspace setup
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push(`/onboarding/workspace?session_id=${sessionId}`);
    }
  }, [userLoaded, isSignedIn, router, sessionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password" || name === "confirmPassword") setPasswordError("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!signUpLoaded) return;

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords must match");
      return;
    }
    setPasswordError("");

    try {
      setLoading(true);

      // Create the sign up
      await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setMode("verify");
      toast.success("Verification code sent to your email!");
    } catch (err) {
      console.error("Sign up error:", err);
      const errorMessage = err.errors?.[0]?.message || "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    if (!signUpLoaded) return;

    try {
      setLoading(true);

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // Create user in database
        await createUserInDatabase();

        toast.success("Account created successfully!");
        router.push(`/onboarding/workspace?session_id=${sessionId}`);
      }
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage = err.errors?.[0]?.message || "Invalid verification code";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!signInLoaded) return;

    try {
      setLoading(true);

      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(`/onboarding/workspace?session_id=${sessionId}`);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      const errorMessage = err.errors?.[0]?.message || "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createUserInDatabase = async () => {
    try {
      await fetch("/api/onboarding/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      });
    } catch (error) {
      console.error("Error creating user in database:", error);
      // Non-blocking - Clerk webhook will handle this as backup
    }
  };

  if (!userLoaded || !signUpLoaded || !signInLoaded) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-teal mx-auto" />
            <p className="text-gray-600 mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            ✓
          </div>
          <span className="text-sm font-medium text-green-600">Payment</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-white text-sm font-medium">
            2
          </div>
          <span className="text-sm font-medium text-brand-teal">Account</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium">
            3
          </div>
          <span className="text-sm text-gray-400">Workspace</span>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === "verify" ? "Verify Your Email" : mode === "signup" ? "Create Your Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {mode === "verify"
              ? "Enter the verification code sent to your email"
              : mode === "signup"
                ? "Set up your account to get started"
                : "Sign in to continue with your subscription"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {mode === "verify" ? (
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                Verify Email
              </Button>
              <p className="text-sm text-center text-gray-500">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={() => signUp?.prepareEmailAddressVerification({ strategy: "email_code" })}
                  className="text-brand-teal hover:underline"
                >
                  Resend
                </button>
              </p>
            </form>
          ) : mode === "signup" ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${passwordError ? "border-red-500" : ""}`}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${passwordError ? "border-red-500" : ""}`}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-brand-teal hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-sm text-center text-gray-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-brand-teal hover:underline"
                >
                  Create one
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-center text-gray-500 mt-6">
        By continuing, you agree to our{" "}
        <Link href="/legal/terms-of-condition" className="text-brand-teal hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy-policy" className="text-brand-teal hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
