'use client'

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignIn, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  Globe,
  GraduationCap,
  ArrowLeft,
  Sparkles,
  Trophy,
  BookOpen,
  Brain,
  Zap,
  ChevronRight,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User
} from 'lucide-react';

const FloatingIcon = ({ icon: Icon, delay = 0, className = "" }) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0]
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className={`absolute p-4 rounded-4xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className}`}
  >
    <Icon className="w-8 h-8 text-white" />
  </motion.div>
);

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Animated Blobs */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 100, 0],
        y: [0, -50, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-brand-teal/20 rounded-full blur-[120px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -120, 0],
        y: [0, 80, 0]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] bg-brand-dark-blue/20 rounded-full blur-[120px]"
    />

    {/* Floating Elements */}
    <FloatingIcon icon={BookOpen} delay={0} className="top-[15%] left-[10%] opacity-40" />
    <FloatingIcon icon={Trophy} delay={1} className="top-[60%] left-[20%] opacity-30" />
    <FloatingIcon icon={Brain} delay={2} className="top-[30%] right-[15%] opacity-40" />
    <FloatingIcon icon={Sparkles} delay={3} className="bottom-[20%] right-[25%] opacity-30" />
    <FloatingIcon icon={Zap} delay={4} className="top-[80%] left-[40%] opacity-20" />
  </div>
);

const SignInPage = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mode, setMode] = useState('signin'); // signin, reset, 2fa
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState(''); // 2FA code
  type SecondFactorStrategy = { strategy: string; phoneNumberId?: string; emailAddressId?: string };
  const [twoFactorStrategy, setTwoFactorStrategy] = useState<SecondFactorStrategy | null>(null);
  const [error, setError] = useState(''); // Error message for sign-in
  const [resetError, setResetError] = useState(''); // Error message for password reset
  const [twoFactorError, setTwoFactorError] = useState(''); // Error message for 2FA

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [userLoaded, isSignedIn, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!signInLoaded) return;

    try {
      setLoading(true);
      setError(''); // Clear previous errors

      // WORKAROUND: Try username directly first (for tenants that don't require email)
      let identifier = username;
      type SignInResult = { status: string; createdSessionId?: string; supportedSecondFactors?: unknown[] };
      let result: SignInResult | null = null;

      // First, try username directly (if Clerk has username authentication enabled)
      try {
        result = await signIn.create({
          identifier: username,
          password: password,
        }) as SignInResult;

        // If it works, great! Username authentication is enabled
        if (result && result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.push('/home');
          setLoading(false);
          return;
        } else if (result && result.status === 'needs_second_factor') {
          // 2FA required - username auth works, continue to 2FA handling below
          identifier = username;
        } else {
          // Some other status - might need lookup, but continue with result
          identifier = username;
        }
      } catch (directError: unknown) {
        // Username direct auth failed - likely "identifier is invalid"
        const e = directError as { errors?: { message?: string }[]; message?: string };
        const errorMsg = e.errors?.[0]?.message || e.message || '';
        const isInvalidIdentifier = errorMsg.toLowerCase().includes('invalid') ||
          errorMsg.toLowerCase().includes('identifier') ||
          errorMsg.toLowerCase().includes('not found');

        if (isInvalidIdentifier) {
          result = null; // Clear result so we do lookup
        } else {
          // Some other error (wrong password, etc.) - show error
          throw directError;
        }
      }

      // If username direct auth didn't work, do email/phone lookup
      if (!result) {
        try {
          const response = await fetch(`/api/users/lookup?username=${encodeURIComponent(username)}`);
          const contentType = response.headers.get('content-type');
          let data;

          if (contentType && contentType.includes('application/json')) {
            try {
              data = await response.json();
            } catch (jsonError) {
              console.error('Failed to parse JSON response:', jsonError);
              setError('User not found. Please check your username or use your email to sign in.');
              setLoading(false);
              return;
            }
          } else {
            const text = await response.text();
            console.error('Lookup API returned non-JSON:', response.status, text);
            setError('User not found. Please check your username or use your email to sign in.');
            setLoading(false);
            return;
          }

          if (response.ok) {
            const lookupData = data.data || data;

            // WORKAROUND: Check if username-only auth is supported
            if (lookupData.useUsername && lookupData.identifier === username) {
              // Username-only authentication is available for this tenant
              // Try username again (it might work now that we know user exists)
              try {
                result = await signIn.create({
                  identifier: username,
                  password: password,
                }) as SignInResult;
              } catch (retryError) {
                // Still failed, use the identifier from lookup (shouldn't happen, but fallback)
                identifier = lookupData.identifier || lookupData.email || lookupData.phoneNumber;
                if (!identifier) {
                  const errorMsg = 'Unable to authenticate. Please contact support.';
                  setError(errorMsg);
                  setLoading(false);
                  return;
                }
                result = await signIn.create({
                  identifier: identifier,
                  password: password,
                }) as SignInResult;
              }
            } else if (lookupData.identifier) {
              identifier = lookupData.identifier;
            } else if (lookupData.email) {
              identifier = lookupData.email;
            } else if (lookupData.phoneNumber) {
              identifier = lookupData.phoneNumber;
            } else {
              const errorMsg = 'Unable to find email or phone number for this username. Please use your email to sign in or contact support.';
              console.error('Lookup failed - no identifier:', lookupData);
              setError(errorMsg);
              setLoading(false);
              return;
            }

            // If we haven't created result yet, create it now
            if (!result) {
              result = await signIn.create({
                identifier: identifier,
                password: password,
              }) as SignInResult;
            }
          } else {
            let errorMessage = 'User not found';
            if (data) {
              if (typeof data === 'string') {
                errorMessage = data;
              } else if (data.error) {
                errorMessage = data.error;
              } else if (data.message) {
                errorMessage = data.message;
              } else if (data.data?.error) {
                errorMessage = data.data.error;
              } else if (Object.keys(data).length === 0) {
                errorMessage = 'User not found. Please check your username or use your email to sign in.';
              }
            }
            console.error('Lookup API error:', response.status, data);
            setError(errorMessage);
            setLoading(false);
            return;
          }
        } catch (lookupError) {
          console.error('Username lookup fetch error:', lookupError);
          setError('Unable to verify username. Please use your email to sign in or contact support.');
          setLoading(false);
          return;
        }
      }

      if (result && result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push('/home');
      } else if (result && result.status === 'needs_second_factor') {
        // Check available second factor strategies
        const supportedFactors = result.supportedSecondFactors || [];

        // Find TOTP factor (no preparation needed)
        const totpFactor = supportedFactors.find((f: unknown) => (f as { strategy?: string }).strategy === 'totp');
        if (totpFactor) {
          setMode('2fa');
          setTwoFactorStrategy(totpFactor as SecondFactorStrategy);
          setError('');
          toast.info('Please enter your authenticator app code');
          setLoading(false);
          return;
        }

        // Find phone code factor (requires preparation)
        const phoneFactor = supportedFactors.find((f: unknown) => (f as { strategy?: string }).strategy === 'phone_code');
        if (phoneFactor) {
          try {
            await signIn.prepareSecondFactor({
              strategy: 'phone_code',
              phoneNumberId: (phoneFactor as { phoneNumberId: string }).phoneNumberId,
            });
            setMode('2fa');
            setTwoFactorStrategy(phoneFactor as SecondFactorStrategy);
            setError('');
            toast.info('Please enter the code sent to your phone');
            setLoading(false);
            return;
          } catch (prepError: unknown) {
            const pe = prepError as { errors?: { message?: string }[]; message?: string };
            const errorMsg = pe.errors?.[0]?.message || pe.message || 'Unable to send verification code. Please try again or contact support.';
            setError(errorMsg);
            setLoading(false);
            return;
          }
        }

        // Find email code factor (requires preparation)
        const emailFactor = supportedFactors.find((f: unknown) => (f as { strategy?: string }).strategy === 'email_code');
        if (emailFactor) {
          try {
            await signIn.prepareSecondFactor({
              strategy: 'email_code',
              emailAddressId: (emailFactor as { emailAddressId: string }).emailAddressId,
            });
            setMode('2fa');
            setTwoFactorStrategy(emailFactor as SecondFactorStrategy);
            setError('');
            toast.info('Please enter the code sent to your email');
            setLoading(false);
            return;
          } catch (prepError: unknown) {
            const pe = prepError as { errors?: { message?: string }[]; message?: string };
            const errorMsg = pe.errors?.[0]?.message || pe.message || 'Unable to send verification code. Please try again or contact support.';
            setError(errorMsg);
            setLoading(false);
            return;
          }
        }

        // No supported factors found
        console.error('No supported 2FA strategies found:', supportedFactors);
        setError('Two-factor authentication is required but no method is available. Please contact support.');
      } else {
        setError('Sign-in incomplete. Please try again.');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string; longMessage?: string }[]; message?: string };
      let errorMessage = 'Invalid username or password';
      if (e.errors && Array.isArray(e.errors) && e.errors.length > 0) {
        const first = e.errors[0];
        errorMessage = first?.message || (first as { longMessage?: string })?.longMessage || errorMessage;
      } else if (e.message) {
        errorMessage = e.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (strategy) => {
    if (!signInLoaded) return;

    try {
      setLoading(true);
      setError(''); // Clear previous errors
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/home',
        redirectUrlComplete: '/home',
      });
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      const errorMessage = e.errors?.[0]?.message || 'Failed to sign in with social provider. Please check if this provider is enabled in your Clerk dashboard.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // For password reset, we need email address
    // Show a prompt or form to enter email
    if (!resetEmail) {
      // If no email entered yet, switch to reset mode to collect email
      setMode('reset');
      return;
    }

    if (!signInLoaded) return;

    try {
      setLoading(true);
      setResetError(''); // Clear previous errors
      await signIn.create({
        identifier: resetEmail, // Use email for password reset
      });
      await signIn.prepareFirstFactor({
        strategy: 'reset_password_email_code',
        emailAddressId: (signIn as unknown as { firstFactor?: { emailAddressId?: string } }).firstFactor?.emailAddressId ?? '',
      } as { strategy: 'reset_password_email_code'; emailAddressId: string });
      toast.success('Password reset code sent to your email!');
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      const errorMessage = e.errors?.[0]?.message || 'Failed to send reset code';
      setResetError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!signInLoaded) return;

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords must match');
      return;
    }
    setResetError('');

    try {
      setLoading(true);

      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        toast.success('Password reset successfully!');
        router.push('/home');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      const errorMessage = e.errors?.[0]?.message || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInLoaded) return;

    try {
      setLoading(true);
      setTwoFactorError('');

      // Use the stored strategy from when we prepared 2FA
      if (!twoFactorStrategy) {
        // Fallback: check available strategies
        const supportedFactors = signIn.supportedSecondFactors || [];

        // Try the first available strategy
        const strategy = supportedFactors[0];
        if (strategy) {
          const result = await signIn.attemptSecondFactor({
            strategy: (strategy.strategy === 'email_link' ? 'email_code' : strategy.strategy) as 'phone_code' | 'email_code' | 'totp' | 'backup_code',
            code: twoFactorCode,
            ...('phoneNumberId' in strategy && strategy.phoneNumberId && { phoneNumberId: strategy.phoneNumberId }),
            ...('emailAddressId' in strategy && strategy.emailAddressId && { emailAddressId: strategy.emailAddressId }),
          });

          if (result.status === 'complete') {
            await setActive({ session: result.createdSessionId });
            router.push('/home');
            return;
          }
        }
      } else {
        // Use the stored strategy
        const result = await signIn.attemptSecondFactor({
          strategy: twoFactorStrategy.strategy as 'phone_code' | 'email_code' | 'totp' | 'backup_code',
          code: twoFactorCode,
          ...('phoneNumberId' in twoFactorStrategy && twoFactorStrategy.phoneNumberId && { phoneNumberId: twoFactorStrategy.phoneNumberId }),
          ...('emailAddressId' in twoFactorStrategy && twoFactorStrategy.emailAddressId && { emailAddressId: twoFactorStrategy.emailAddressId }),
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.push('/home');
          return;
        }
      }

      // If we get here, the code was invalid
      setTwoFactorError('Invalid code. Please try again.');
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[]; message?: string };
      const errorMessage = e.errors?.[0]?.message || e.message || 'Invalid authentication code. Please try again.';
      setTwoFactorError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Left side - Dynamic Visual */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0F172A] overflow-hidden">
        <AnimatedBackground />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Top: Logo Area */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => router.push('/')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-3 shadow-lg transition-all border border-white/10 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Skill-Learn</span>
            </div>
          </motion.div>

          {/* Middle: Fun Messaging */}
          <div className="space-y-6">
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-brand-teal font-black leading-[1.1] tracking-tight"
            >
              Ready to <br />
              <span className="text-indigo-400">level up</span> <br />
              your skills?
            </motion.h2>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 text-lg max-w-sm leading-relaxed"
            >
              Join thousands of professionals mastering new tech every day. Your learning adventure awaits!
            </motion.p>
          </div>

          {/* Bottom: Mini Social Proof */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 p-6 bg-white/5 rounded-4xl border border-white/10 backdrop-blur-sm"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-slate-800 overflow-hidden relative">
                  <Image
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                    alt="User"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-300 font-medium">
              Join <span className="text-white font-bold">12k+</span> students today!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Playful Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 lg:p-12 relative overflow-hidden">
        {/* Subtle background pattern for context */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap gap-12 justify-center content-center rotate-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <GraduationCap key={i} size={80} className="text-slate-900" />
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[440px] z-10"
        >
          {/* Header Mobile */}
          <div className="lg:hidden flex justify-between items-center mb-10 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Skill-Learn</span>
            </div>
          </div>

          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-4xl lg:text-brand-teal font-black text-slate-900 mb-4 tracking-tight">
              Welcome Back! 👋
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              We missed you! Let&apos;s get back to learning.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-100 mb-8"
          >
            {!signInLoaded ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : mode === '2fa' ? (
              // Two-Factor Authentication Form
              <form onSubmit={handleTwoFactor} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Two-Factor Authentication</h2>
                  <p className="text-sm text-slate-600">
                    Enter the code from your authenticator app or SMS
                  </p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {twoFactorError && (
                    <motion.div
                      key="2fa-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border-2 border-red-200 rounded-4xl text-sm text-red-700"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">⚠️</span>
                        <span>{twoFactorError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Authentication Code</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => {
                        setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setTwoFactorError('');
                      }}
                      placeholder="000000"
                      required
                      maxLength={6}
                      autoComplete="one-time-code"
                      className={`w-full h-14 pl-12 pr-6 bg-slate-50 border-2 rounded-4xl focus:outline-none focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 text-center text-xl tracking-widest font-mono ${twoFactorError ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500'
                        }`}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || !twoFactorCode || twoFactorCode.length < 6}
                  className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-4xl font-bold text-lg shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setTwoFactorCode('');
                    setTwoFactorError('');
                    setTwoFactorStrategy(null);
                    setUsername('');
                    setPassword('');
                  }}
                  className="w-full text-sm text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
                >
                  Back to sign in
                </button>
              </form>
            ) : mode === 'reset' ? (
              !resetEmail ? (
                // Step 1: Collect email for password reset
                <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
                    <p className="text-sm text-slate-600">
                      Enter your email address to receive a password reset code
                    </p>
                  </div>

                  {/* Error Message */}
                  {resetError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-4xl text-sm text-red-700">
                      {resetError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setResetError(''); // Clear error when user types
                        }}
                        placeholder="you@example.com"
                        required
                        className={`w-full h-14 pl-12 pr-6 bg-slate-50 border-2 rounded-4xl focus:outline-none focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200 ${resetError ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500'
                          }`}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !resetEmail}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-4xl font-bold text-lg shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Code</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setResetEmail('');
                    }}
                    className="w-full text-sm text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
                  >
                    Back to sign in
                  </button>
                </form>
              ) : (
                // Step 2: Enter code and new password
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
                    <p className="text-sm text-slate-600">
                      Enter the code sent to <strong>{resetEmail}</strong> and your new password
                    </p>
                  </div>

                  {/* Error Message */}
                  {resetError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-4xl text-sm text-red-700">
                      {resetError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Verification Code</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => {
                          setResetCode(e.target.value);
                          setResetError(''); // Clear error when user types
                        }}
                        placeholder="Enter 6-digit code"
                        required
                        maxLength={6}
                        className={`w-full h-14 pl-12 pr-6 bg-slate-50 border-2 rounded-4xl focus:outline-none focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 text-center text-xl tracking-widest font-mono ${resetError ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setResetError('');
                        }}
                        placeholder="Enter new password (min 8 characters)"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className={`w-full h-14 pl-12 pr-12 bg-slate-50 border-2 rounded-4xl focus:outline-none focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200 ${resetError ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Confirm new password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          setResetError('');
                        }}
                        placeholder="Re-enter new password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className={`w-full h-14 pl-12 pr-12 bg-slate-50 border-2 rounded-4xl focus:outline-none focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200 ${resetError ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500'}`}
                      />
                    </div>
                    {resetError && (
                      <p className="text-sm text-red-600 ml-1">{resetError}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-4xl font-bold text-lg shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setResetCode('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setResetEmail('');
                      setResetError('');
                    }}
                    className="w-full text-sm text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
                  >
                    Back to sign in
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleSignIn} className="space-y-6">
                {/* Social Sign In Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('oauth_google')}
                    disabled={loading}
                    className="w-full h-14 px-6 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-slate-50 rounded-4xl font-bold text-lg text-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="font-bold uppercase tracking-widest">OR</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border-2 border-red-200 rounded-4xl text-sm text-red-700"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">⚠️</span>
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Username Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(''); // Clear error when user types
                      }}
                      placeholder="e.g. learning_ninja"
                      required
                      className={`w-full h-14 pl-12 pr-6 bg-slate-50 border-2 rounded-4xl focus:outline-none focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200 ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500'
                        }`}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 rounded-4xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <motion.button
                  type="submit"
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || !signInLoaded}
                  className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-4xl font-bold text-lg shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Jump In</span>
                      <AnimatePresence>
                        {isHovered ? (
                          <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 10, opacity: 0 }}
                          >
                            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                          >
                            <ChevronRight className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.button>
              </form>
            )}

            <div className="mt-8 flex items-center gap-4 text-xs text-slate-400 justify-center">
              <div className="h-px flex-1 bg-slate-100" />
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secured by Clerk</span>
              </div>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-center text-slate-500 font-medium">
            New here?{' '}
            <Link href="/sign-up" className="text-indigo-600 font-extrabold hover:text-indigo-700 hover:underline transition-colors">
              Create an account
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Footer bar at bottom */}
      <div className="fixed left-0 right-0 bottom-0 bg-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto px-12 py-6 flex items-center justify-between pointer-events-auto">
          <div className="hidden lg:block text-xs font-bold text-slate-600 tracking-wide uppercase opacity-40">
            Skill-Learn.ca · {new Date().getFullYear()}
          </div>

          <div className="flex items-center gap-8">
            {['Privacy', 'Terms', 'Legal'].map((link) => (
              <Link key={link} href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
