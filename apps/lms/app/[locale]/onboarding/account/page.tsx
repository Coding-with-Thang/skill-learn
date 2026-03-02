"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
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

export default function OnboardingAccountPage() {
  const t = useTranslations("onboarding");
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
      setPasswordError(t("passwordsMustMatch"));
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
      toast.success(t("weSentCode"));
    } catch (err) {
      console.error("Sign up error:", err);
      const errorMessage = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message || t("failedToCreateAccount");
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
        await setActive?.({ session: result.createdSessionId });

        // Create user in database
        await createUserInDatabase();

        toast.success(t("youreAllSet"));
        router.push(`/onboarding/workspace?session_id=${sessionId}`);
      }
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message || t("invalidVerificationCode");
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
        await setActive?.({ session: result.createdSessionId });
        router.push(`/onboarding/workspace?session_id=${sessionId}`);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      const errorMessage = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message || t("invalidCredentials");
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
            <p className="text-gray-600 mt-4">{t("loading")}</p>
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
          <span className="text-sm font-medium text-green-600">{t("payment")}</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-white text-sm font-medium">
            2
          </div>
          <span className="text-sm font-medium text-brand-teal">{t("account")}</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium">
            3
          </div>
          <span className="text-sm text-gray-400">{t("workspaceStep")}</span>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === "verify" ? t("verifyYourEmail") : mode === "signup" ? t("createYourAccount") : t("welcomeBack")}
          </CardTitle>
          <CardDescription>
            {mode === "verify"
              ? t("enterVerificationCode")
              : mode === "signup"
                ? t("setUpAccountToGetStarted")
                : t("signInToContinue")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {mode === "verify" ? (
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("verificationCode")}</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder={t("verificationCodePlaceholder")}
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
                {t("verify")}
              </Button>
              <p className="text-sm text-center text-gray-500">
                {t("didntReceiveCode")}{" "}
                <button
                  type="button"
                  onClick={() => signUp?.prepareEmailAddressVerification({ strategy: "email_code" })}
                  className="text-brand-teal hover:underline"
                >
                  {t("resendCode")}
                </button>
              </p>
            </form>
          ) : mode === "signup" ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("firstName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder={t("firstNamePlaceholder")}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("lastName")}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder={t("lastNamePlaceholder")}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
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
                  {t("passwordMinLength")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("confirmPasswordPlaceholder")}
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
                {t("signUp")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-sm text-center text-gray-500">
                {t("alreadyHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-brand-teal hover:underline"
                >
                  {t("signIn")}
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("signInPasswordPlaceholder")}
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
                {t("signIn")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-sm text-center text-gray-500">
                {t("dontHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-brand-teal hover:underline"
                >
                  {t("signUp")}
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
