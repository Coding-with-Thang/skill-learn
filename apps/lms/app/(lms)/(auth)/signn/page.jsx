'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    className={`absolute p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className}`}
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
  const [mode, setMode] = useState('signin'); // signin, reset
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

      // Look up the user to verify they exist and get email if available
      // Clerk supports both email and username authentication
      let identifier = username; // Default to username

      try {
        const response = await fetch(`/api/users/lookup?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        if (response.ok) {
          // successResponse wraps data in a 'data' property
          const lookupData = data.data || data;
          // Use email if available, otherwise use username (Clerk supports both)
          if (lookupData.email && lookupData.useEmail) {
            identifier = lookupData.email;
          } else {
            // Use username directly - Clerk supports username authentication
            identifier = username;
          }
          // If fallback mode (database unavailable), proceed with username authentication
          // No need to show error - Clerk will handle authentication
        } else {
          // User not found in database, but still try with username
          // Clerk might have the user even if our database doesn't
          const errorMessage = data.error || data.message;
          if (errorMessage && !errorMessage.includes('not found')) {
            // Only show error if it's not a "not found" error
            // For "not found", we'll still try with username
            console.warn('Lookup returned error, trying with username:', errorMessage);
          }
          identifier = username;
        }
      } catch (lookupError) {
        // If lookup fails (e.g., database unavailable), still try with username directly
        // Clerk might have the user even if our database lookup fails
        console.warn('Username lookup error, trying with username directly:', lookupError);
        identifier = username;
      }

      const result = await signIn.create({
        identifier: identifier,
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success('Welcome back!');
        router.push('/home');
      } else {
        // Handle additional steps (e.g., 2FA, verification)
        if (result.status === 'needs_second_factor') {
          toast.info('Please complete two-factor authentication');
          // You can add 2FA handling here
        }
      }
    } catch (err) {
      console.error('Sign in error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Invalid username or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (strategy) => {
    if (!signInLoaded) return;

    try {
      setLoading(true);
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/home',
        redirectUrlComplete: '/home',
      });
    } catch (err) {
      console.error('Social sign in error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to sign in with social provider. Please check if this provider is enabled in your Clerk dashboard.';
      toast.error(errorMessage);
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
      await signIn.create({
        identifier: resetEmail, // Use email for password reset
      });
      await signIn.prepareFirstFactor({
        strategy: 'reset_password_email_code',
      });
      toast.success('Password reset code sent to your email!');
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to send reset code';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!signInLoaded) return;

    try {
      setLoading(true);

      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success('Password reset successfully!');
        router.push('/home');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to reset password';
      toast.error(errorMessage);
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
              className="text-5xl font-black text-white leading-[1.1] tracking-tight"
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
          {/* Header Moble */}
          <div className="lg:hidden flex justify-between items-center mb-10 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Skill-Learn</span>
            </div>
          </div>

          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Welcome Back! 👋
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              We missed you! Let&apos;s get back to learning.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-100 mb-8"
          >
            {!signInLoaded ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !resetEmail}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Verification Code</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        required
                        maxLength={6}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 text-center text-xl tracking-widest font-mono"
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
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={8}
                        className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200"
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

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      setResetEmail('');
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
                    className="w-full h-14 px-6 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-slate-50 rounded-2xl font-bold text-lg text-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="font-bold uppercase tracking-widest">OR</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. learning_ninja"
                      required
                      className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200"
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
                      className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 group-hover:border-slate-200"
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
                  className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
