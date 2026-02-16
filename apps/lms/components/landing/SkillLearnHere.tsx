"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Play, Lightbulb, Trophy, TrendingUp, Sparkles, X } from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";

export default function SkillLearnHere() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isVideoPlaying) {
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch (e) { }
        try { videoRef.current.currentTime = 0; } catch (e) { }
      }
      return;
    }

    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
      videoRef.current.focus?.();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVideoPlaying(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVideoPlaying]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-[#40C9FF] via-[#3FA7D6] to-[#48B1BF] p-8 md:p-16 lg:p-20 shadow-2xl shadow-blue-500/20">

        {/* Background Decorative Icons */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 opacity-10 pointer-events-none">
          <Lightbulb size={240} className="text-white" />
        </div>
        <div className="absolute -bottom-10 -left-10 opacity-10 pointer-events-none rotate-12">
          <Sparkles size={180} className="text-white" />
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content - Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              New Performance Suite
            </div>

            <h2 className="text-brand-teal md:text-7xl font-extrabold leading-[1.1] tracking-tight font-display">
              Empower Your <br />
              Team with <br />
              Skill-Learn
            </h2>

            <p className="text-lg md:text-xl font-medium text-white/90 max-w-lg leading-relaxed">
              Experience the next generation of team growth. Our platform integrates deep performance analytics with gamified learning to unlock your team's full potential.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-white/90 h-14 px-8 rounded-4xl font-bold text-lg group shadow-lg shadow-black/5"
              >
                <Link href="/pricing">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsVideoPlaying(true)}
                className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 h-14 px-8 rounded-4xl font-bold text-lg"
              >
                <Play className="mr-2 w-5 h-5 fill-current" />
                Watch Video
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Visual Dashboard */}
          <div className="relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-md aspect-\s3 bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Performance Insights</h3>
                  <p className="text-sm text-slate-400 font-medium">Real-time engagement metrics</p>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                </div>
              </div>

              {/* Central Chart */}
              <div className="relative flex flex-col items-center justify-center py-4">
                <svg className="w-48 h-48 -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="16"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="transparent"
                    stroke="#00D181"
                    strokeWidth="16"
                    strokeDasharray={2 * Math.PI * 80}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - 0.85) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800 leading-none">85%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Complete</span>
                </div>

                {/* Micro trend labeling */}
                <div className="flex justify-center gap-4 mt-8 w-full">
                  {['MON', 'TUE', 'WED', 'THU'].map(day => (
                    <span key={day} className="text-[10px] font-bold text-slate-300 tracking-widest">{day}</span>
                  ))}
                </div>
              </div>

              {/* Bottom Cards */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-4xl flex items-center gap-3">
                  <div className="text-blue-500 font-black text-xl">85%</div>
                  <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
                </div>
                <div className="p-4 bg-slate-50/50 rounded-4xl relative overflow-hidden group">
                  <div className="flex items-center gap-1.5 text-blue-600 font-black text-lg">
                    <TrendingUp className="w-4 h-4" />
                    12%
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Engagement Boost</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}

            {/* Achievement Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -top-6 -right-6 md:-right-10 bg-white rounded-4xl p-4 shadow-xl border border-slate-50 flex items-center gap-4 z-2000"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Trophy className="text-orange-400 w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Team Progress</p>
                <p className="text-sm font-black text-slate-800">Gold Achievement</p>
              </div>
            </motion.div>

            {/* Analytics Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute -bottom-6 -left-6 md:-left-12 bg-white rounded-4xl p-4 shadow-xl border border-slate-50 flex items-center gap-4 z-2000"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="text-emerald-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Boost</p>
                <p className="text-xs font-black text-slate-800">+ 12% Engagement</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl aspect-video bg-white rounded-4xl overflow-hidden border-2 border-slate-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Demo video"
          >
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-900 z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center text-slate-900 text-xl">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/skill-learn%20demo.mp4?alt=media&token=d38b4738-9d06-4ae5-a264-a23f469ed5c5"
                className="w-full h-full object-cover"
                controls
                playsInline
                autoPlay
                muted
                aria-label="Skill-Learn demo video"
              />
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
