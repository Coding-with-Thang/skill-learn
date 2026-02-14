"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Quote, Box, Layers, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Skill-Learn completely transformed how our marketing team adopts AI. It only took me 1 month to master concepts that used to feel impossible.",
      author: "Sarah Johnson",
      role: "Marketing Manager",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      companyIcon: Layers
    },
    {
      quote: "The interactive coding environments are world-class. I've used dozens of platforms, but Skill-Learn is the only one that actually stuck.",
      author: "Michael Chen",
      role: "Software Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      companyIcon: Box
    },
    {
      quote: "Onboarding our entire HR department was seamless. The progress tracking gave us real data on how our skills were evolving week by week.",
      author: "Emily Rodriguez",
      role: "HR Director",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      companyIcon: BookOpen
    }
  ];

  const clientLogos = ["VECTA", "CLOUDRA", "LUMINA", "SYNTH"];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#EAEDF5]">
      {/* Soft background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(130,140,230,0.15),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 bg-blue-100 text-[#4F67E1] rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            Success Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-[#1B1B53] mb-6 tracking-tight"
          >
            Humanizing the AI<br />Learning Experience
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Join over 50,000+ professionals who have accelerated their careers with Skill-Learn's interactive paths.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              className="group relative bg-white/40 backdrop-blur-xl rounded-[40px] p-10 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={t.avatar}
                    alt={t.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <Quote className="w-12 h-12 text-[#1B1B53]/5 rotate-180" />
              </div>

              <p className="text-xl text-[#1B1B53]/80 mb-10 italic leading-relaxed min-h-[140px]">
                &quot;{t.quote}&quot;
              </p>

              <div className="pt-8 border-t border-[#1B1B53]/5 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#1B1B53] mb-1">{t.author}</h4>
                  <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                </div>
                <t.companyIcon className="w-5 h-5 text-slate-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mb-32">
          <p className="text-sm font-bold text-slate-400 mb-8">Ready to start your own success story?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="h-14 px-10 bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-lg rounded-full shadow-xl shadow-blue-500/20 group">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost" className="h-14 px-8 text-[#1B1B53] font-bold text-lg hover:bg-white/50 rounded-full transition-all">
              View More Stories
            </Button>
          </div>
        </div>

        {/* Client Logos */}
        <div className="flex flex-wrap justify-between items-center gap-12 opacity-30 grayscale pt-16 border-t border-slate-200">
          {clientLogos.map((logo) => (
            <span key={logo} className="text-2xl font-black tracking-tighter text-slate-900 italic">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
