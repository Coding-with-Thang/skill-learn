'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignIn } from '@clerk/nextjs';
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
  ShieldCheck
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
            className="flex items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-slate-800 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
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
            <SignIn
              routing="path"
              path="/signn"
              signUpUrl="/sign-up"
              afterSignInUrl="/home"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "h-14 rounded-2xl font-bold text-lg border-2 border-slate-100 hover:border-indigo-500 hover:bg-slate-50 transition-all",
                  formButtonPrimary: "h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-2xl shadow-slate-900/20 transition-all",
                  formFieldInput: "h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400",
                  formFieldLabel: "text-sm font-bold text-slate-700 ml-1",
                  dividerLine: "bg-slate-100",
                  dividerText: "text-xs text-slate-400 font-bold uppercase tracking-widest",
                  footerActionLink: "text-indigo-600 font-extrabold hover:text-indigo-700 hover:underline transition-colors",
                  identityPreviewText: "text-slate-900 font-medium",
                  identityPreviewEditButton: "text-indigo-600 hover:text-indigo-700",
                  formResendCodeLink: "text-indigo-600 hover:text-indigo-700",
                  alertText: "text-sm",
                  formFieldErrorText: "text-sm text-red-600",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  showOptionalFields: false,
                }
              }}
            />

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
