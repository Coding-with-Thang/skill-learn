"use client"
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle, Target, Rocket, BarChart3, Clock, Zap } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // Refs for parallax elements
  const topBlobRef = useRef(null);
  const bottomBlobRef = useRef(null);
  const topCircleRef = useRef(null);
  const bottomCircleRef = useRef(null);
  const heroRef = useRef(null);
  const activeRef = useRef(false);
  const gridRef = useRef(null);

  // Intersection-aware parallax — parallax runs only while the hero is visible
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If user prefers reduced motion, don't run parallax at all
    if (prefersReduced) return;

    let ticking = false;

    const handleScroll = () => {
      if (!activeRef.current) return; // only update transforms when active
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const rect = heroRef.current?.getBoundingClientRect();
        const y = window.scrollY || window.pageYOffset;

        // We can use the hero's position relative to viewport to tune transforms
        // When hero is higher/lower the transforms change subtly.
        const heroTop = rect ? rect.top : 0;
        // Use a small factor derived from heroTop and global scroll
        const factor = Math.max(0, Math.min(1, 1 - Math.abs(heroTop) / (window.innerHeight * 1.5)));

        if (topBlobRef.current) {
          // Slight inverse y translate (opposite direction of scroll) for depth
          topBlobRef.current.style.transform = `translate3d(${Math.min(30, -y * 0.03 * factor)}px, ${Math.min(60, -y * 0.06 * factor)}px, 0)`;
        }

        if (bottomBlobRef.current) {
          bottomBlobRef.current.style.transform = `translate3d(${Math.max(-30, y * 0.02 * factor)}px, ${Math.max(-60, y * 0.04 * factor)}px, 0)`;
        }

        if (topCircleRef.current) {
          topCircleRef.current.style.transform = `translate3d(${Math.min(20, -y * 0.015 * factor)}px, ${Math.min(30, -y * 0.02 * factor)}px, 0)`;
        }

        if (bottomCircleRef.current) {
          bottomCircleRef.current.style.transform = `translate3d(${Math.max(-20, y * 0.015 * factor)}px, ${Math.max(-30, y * 0.02 * factor)}px, 0)`;
        }

        ticking = false;
      });
    };

    // Intersection observer to toggle activation only when hero is visible
    const io = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      activeRef.current = e.isIntersecting && e.intersectionRatio > 0.05;

      if (activeRef.current) {
        // start listening and align initial transform
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
      } else {
        // stop listening and reset transforms to none
        window.removeEventListener('scroll', handleScroll);
        [topBlobRef, bottomBlobRef, topCircleRef, bottomCircleRef].forEach(r => {
          if (r.current) r.current.style.transform = '';
        });
      }
    }, { root: null, threshold: [0, 0.05, 0.25, 0.5, 1] });

    if (heroRef.current) io.observe(heroRef.current);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Make grid overlay full viewport width and align it vertically to the hero
  useEffect(() => {
    const grid = gridRef.current;
    const hero = heroRef.current;

    if (!grid || !hero) return;

    const setGrid = () => {
      const rect = hero.getBoundingClientRect();
      const docTop = rect.top + window.pageYOffset;
      const height = rect.height;

      Object.assign(grid.style, {
        position: 'fixed',
        left: '0px',
        width: '100vw',
        top: `${docTop}px`,
        height: `${height}px`,
        transform: 'none'
      });
    };

    // Initial set
    setGrid();

    const onResize = () => setGrid();
    const onScroll = () => setGrid();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      if (grid) {
        grid.style.position = '';
        grid.style.left = '';
        grid.style.width = '';
        grid.style.top = '';
        grid.style.height = '';
        grid.style.transform = '';
      }
    };
  }, []);

  // Manage video playback and keyboard close while modal is open
  useEffect(() => {
    if (!isVideoPlaying) {
      // Ensure any playing video is paused and seeked back
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch (e) { }
        try { videoRef.current.currentTime = 0; } catch (e) { }
      }
      return;
    }

    // When opening, try to play and give focus to video element.
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // play may fail if browser blocks autoplay with sound — it's okay
      });
      videoRef.current.focus?.();
    }

    const onKey = (e) => {
      if (e.key === "Escape") setIsVideoPlaying(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVideoPlaying]);

  return (
    <div ref={heroRef} className="relative min-h-[80dvh] bg-white overflow-hidden">
      {/* Full-bleed background container - spans the entire viewport width */}
      <div className="absolute inset-0 pointer-events-none w-screen left-1/2 -translate-x-1/2 overflow-hidden">
        {/* Background visuals are full-bleed and independent of the centered content */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Dot pattern background */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #155d59 1px, transparent 0)`,
              backgroundSize: '40px 40px',
              opacity: 0.08
            }}
          ></div>

          {/* Static gradient areas (responsive sizes) */}
          <div
            ref={topBlobRef}
            className="absolute top-0 right-0 w-[520px] h-[520px] md:w-[600px] md:h-[600px] lg:w-[720px] lg:h-[720px] bg-linear-to-br from-brand-teal/22 to-transparent rounded-full blur-3xl transform-gpu will-change-transform"
            aria-hidden
          />
          <div
            ref={bottomBlobRef}
            className="absolute bottom-0 left-0 w-[360px] h-[360px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-linear-to-tr from-brand-dark-blue/18 to-transparent rounded-full blur-3xl transform-gpu will-change-transform"
            aria-hidden
          />

          {/* Decorative circles */}
          <div
            ref={topCircleRef}
            className="absolute top-24 md:top-32 right-28 md:right-32 w-20 md:w-32 h-20 md:h-32 border-2 border-brand-teal/30 rounded-full transform-gpu will-change-transform"
            style={{ opacity: 0.12 }}
            aria-hidden
          />
          <div
            ref={bottomCircleRef}
            className="absolute bottom-28 md:bottom-40 right-20 md:right-40 w-16 md:w-24 h-16 md:h-24 border-2 border-brand-dark-blue/30 rounded-full transform-gpu will-change-transform"
            style={{ opacity: 0.12 }}
            aria-hidden
          />

          {/* Grid overlay (full-bleed) */}
          <div
            ref={gridRef}
            className="absolute inset-0 pointer-events-none w-screen left-1/2 -translate-x-1/2"
            style={{
              opacity: 0.05,
              backgroundImage: `
                linear-gradient(#155d59 1px, transparent 1px),
                linear-gradient(90deg, #155d59 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up order-2 lg:order-1">
            {/* Trust Badge with Urgency */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/5 border border-brand-teal/20 rounded-full backdrop-blur-sm">
              <Clock className="w-4 h-4 text-brand-teal" />
              <span className="text-sm text-brand-dark-blue font-medium">Limited spots - Join 1.2K+ on waitlist</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-brand-teal lg:text-7xl font-bold text-gray-900 leading-tight">
                <span className="bg-linear-to-r from-brand-teal to-brand-dark-blue bg-clip-text text-transparent">
                  AI-Powered
                </span>
                {' '}Learning That Actually Works
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                Join 250+ beta testers experiencing 2.5x faster skill development with personalized AI coaching.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-brand-teal to-brand-dark-blue hover:from-brand-teal-dark hover:to-brand-dark-blue/90 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                Join Waitlist
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-brand-teal text-brand-teal font-semibold rounded-lg hover:bg-brand-teal/5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Schedule Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                      alt="User"
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                Join 1,200+ professionals already learning
              </span>
            </div>

            {/* Outcome-based Features */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Save 10+ Hours Per Week
                  </h4>
                  <p className="text-sm text-gray-600">
                    AI screens candidates automatically, so you focus on top talent
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Visual */}
          <div className="relative h-auto lg:h-[650px] animate-slide-in-right order-1 lg:order-2">
            {/* Tasks Card (Behind) */}
            <div className="hidden lg:block absolute top-52 right-20 w-full max-w-md bg-white rounded-4xl shadow-xl hover:shadow-[0_25px_60px_rgba(21,93,89,0.2)] transition-all duration-300 z-10 overflow-hidden">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Tasks Overview</h3>

                {/* To Do */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">To Do:</h4>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-700">Complete first course</span>
                  </div>
                </div>

                {/* Started */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Started:</h4>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-yellow-400 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-sm"></div>
                    </div>
                    <span className="text-sm text-gray-700">Exploring platform features</span>
                  </div>
                </div>

                {/* Completed */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Completed:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 line-through">Complete onboarding</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 line-through">Review company policies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card (Front) */}
            <div className="hidden lg:block absolute top-0 right-0 w-full max-w-md bg-white rounded-4xl shadow-2xl hover:shadow-[0_25px_60px_rgba(21,93,89,0.2)] transition-all duration-300 z-2000 overflow-hidden">
              {/* Gradient Header */}
              <div className="h-24 bg-linear-to-r from-brand-teal/60 via-brand-dark-blue/40 to-brand-teal/40 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden relative">
                    <Image
                      src="https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/courses%2Ffeatures%2Fprofile.jpg?alt=media&token=b0ece0df-5e88-45eb-aae9-89a7320cd627"
                      alt="Sarah Johnson"
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-14 px-6 pb-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sarah Johnson</h3>
                  <p className="text-sm text-gray-500">Contingency Agent</p>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  {['Leadership Skills', 'Technical Training', 'Soft Skills'].map((skill, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{skill}</span>
                        <span className="text-brand-teal font-semibold">{85 - index * 10}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-brand-teal to-brand-dark-blue rounded-full animate-progress"
                          style={{ width: `${85 - index * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar at Bottom */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "1.2K+", label: "Waitlist Members" },
              { value: "250+", label: "Beta Testers" },
              { value: "96%", label: "Interest Score" },
              { value: "Q2 2026", label: "Launch Date" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-brand-teal to-brand-dark-blue bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Video Modal */}
      {isVideoPlaying && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-white rounded-4xl overflow-hidden border-2 border-gray-200 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Demo video"
          >
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-900 z-10 transition-colors"
            >
              ✕
            </button>
            <div className="absolute inset-0 flex items-center justify-center text-gray-900 text-xl">
              <video
                ref={videoRef}
                src={"https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/skill-learn%20demo.mp4?alt=media&token=d38b4738-9d06-4ae5-a264-a23f469ed5c5"}
                className="w-full h-full object-cover"
                controls
                playsInline
                autoPlay
                muted
                aria-label="Skill-Learn demo video"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}