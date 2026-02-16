"use client"

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { useSignUp, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AtSign,
} from 'lucide-react';

export default function SignUpPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant');
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();

  const [authSettings, setAuthSettings] = useState({ requireEmail: true });
  const [authSettingsLoaded, setAuthSettingsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(''); // e.g. "Passwords must match"
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signup'); // signup, verify
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(''); // Error message for sign-up
  const [verificationError, setVerificationError] = useState(''); // Error message for verification

  // Fetch auth settings (e.g. whether this tenant requires email for sign-up)
  useEffect(() => {
    const url = tenantSlug
      ? `/api/public/auth-settings?tenant=${encodeURIComponent(tenantSlug)}`
      : '/api/public/auth-settings';
    fetch(url)
      .then((res) => res.json())
      .then((data) => setAuthSettings({ requireEmail: data.requireEmail !== false }))
      .catch(() => setAuthSettings({ requireEmail: true }))
      .finally(() => setAuthSettingsLoaded(true));
  }, [tenantSlug]);

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [userLoaded, isSignedIn, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
    if (name === 'password' || name === 'confirmPassword') setPasswordError('');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!signUpLoaded) return;

    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t("passwordsMustMatch"));
      return;
    }
    setPasswordError('');

    try {
      setLoading(true);

      await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setMode('verify');
      toast.success(t("verificationCodeSent"));
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      const errorMessage = e.errors?.[0]?.message || t("failedToCreateAccount");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign up with username + password only (no email) — for tenants that don't require email
  const handleSignUpWithUsername = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;

    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t("passwordsMustMatch"));
      return;
    }
    setPasswordError('');

    try {
      setLoading(true);
      setError('');

      const result = await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username.trim(),
        password: formData.password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        toast.success(t("accountCreatedSuccessfully"));
        router.push('/home');
      } else {
        toast.error(t("signUpCouldNotComplete"));
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      const errorMessage = e.errors?.[0]?.message || t("failedToCreateAccount");
      setError(errorMessage);
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
      setVerificationError(''); // Clear previous errors

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success(t("accountCreatedSuccessfully"));
        router.push('/home');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      const errorMessage = e.errors?.[0]?.message || t("invalidVerificationCode");
      setVerificationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (strategy) => {
    if (!signUpLoaded) return;

    try {
      setLoading(true);
      setError(''); // Clear previous errors
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/home',
        redirectUrlComplete: '/home',
      });
    } catch {
      setError(t("failedToSignUpSocial"));
      setLoading(false);
    }
  };

  if (mode === 'verify') {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:block w-1/2 h-full bg-linear-to-br from-indigo-600 to-purple-600" />
        <div className="w-full lg:w-1/2 flex justify-center items-center px-8 py-12 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("checkYourEmail")}</h1>
              <p className="text-slate-600">
                {t("weSentVerificationCode", { email: formData.email })}
              </p>
            </div>

            <form onSubmit={handleVerification} className="space-y-6">
              {/* Error Message */}
              {verificationError && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700">
                  {verificationError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("verificationCode")}
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setVerificationError(''); // Clear error when user types
                  }}
                  placeholder={t("enter6DigitCode")}
                  required
                  maxLength={6}
                  className={`w-full h-14 px-4 border-2 rounded-xl focus:outline-none text-center text-2xl tracking-widest font-mono ${verificationError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !signUpLoaded}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t("verifyEmail")}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setVerificationCode('');
                }}
                className="w-full text-sm text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {t("backToSignUp")}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Hero Banner */}
      <div
        className="hidden lg:block w-1/2 h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-image.jpg')", minHeight: '100vh' }}
        aria-label="Hero banner"
      />

      {/* Sign Up Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center px-8 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{t("createAccountTitle")}</h1>
            <p className="text-slate-600">{t("startLearningJourney")}</p>
          </div>

          {!signUpLoaded || !authSettingsLoaded ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <form
              onSubmit={authSettings.requireEmail ? handleSignUp : handleSignUpWithUsername}
              className="space-y-5"
            >
              {/* Social Sign Up: only show when email is required (Google typically needs email) */}
              {authSettings.requireEmail && (
                <>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleSocialSignUp('oauth_google')}
                      disabled={loading}
                      className="w-full h-14 px-6 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:bg-slate-50 rounded-xl font-semibold text-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {t("continueWithGoogle")}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="font-semibold uppercase tracking-widest">{t("or")}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("firstName")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder={t("firstNamePlaceholder")}
                      required
                      className="w-full h-12 pl-10 pr-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("lastName")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder={t("lastNamePlaceholder")}
                      required
                      className="w-full h-12 pl-10 pr-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email (when tenant requires email) or Username (when tenant allows no-email sign-up) */}
              {authSettings.requireEmail ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t("emailPlaceholder")}
                      required
                      className="w-full h-12 pl-10 pr-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("username")}</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={t("usernameSignUpPlaceholder")}
                      required
                      minLength={4}
                      autoComplete="username"
                      className="w-full h-12 pl-10 pr-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t("createPasswordPlaceholder")}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`w-full h-12 pl-10 pr-12 border-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all ${passwordError ? 'border-red-300' : 'border-slate-200'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("confirmPassword")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t("confirmPasswordPlaceholder")}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`w-full h-12 pl-10 pr-12 border-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all ${passwordError ? 'border-red-300' : 'border-slate-200'}`}
                  />
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading || !signUpLoaded}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t("createAccount")}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t("securedByClerk")}</span>
              </div>
            </form>
          )}

          <p className="text-center text-slate-600 mt-6">
            {t("alreadyHaveAccount")}{' '}
            <Link
              href={tenantSlug ? `/sign-in?tenant=${encodeURIComponent(tenantSlug)}` : '/sign-in'}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}