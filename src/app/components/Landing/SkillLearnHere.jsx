"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SkillLearnHere() {
  return (
    <section className="bg-brand-teal text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Skill-Learn is here
            </h2>
            <p className="text-lg leading-relaxed opacity-90">
              Skill-Learn - the latest innovation of our platform, makes it easy for every team to work better, make mistakes before they count, and gain insights into product specific knowledge and industry best practices. Tap into the most powerful work management solution without conflicts and experience configurable full scalability and ease of use - all at once.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-3 bg-white/0 hover:bg-white/0 hover:text-gray-300 border-white text-2xl text-white"
            >
              <Link href="/about">Learn more</Link>
            </Button>
          </div>

          {/* Right Side - Image Placeholder (3D Bar Chart) */}
          <div className="bg-white/10 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="bg-white/20 rounded-lg p-6 w-full">
              <h3 className="text-xl font-bold mb-6 text-center">Performance Analytics</h3>
              <div className="flex items-end justify-center gap-4 h-48">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-white rounded-t" style={{ height: "120px" }}></div>
                  <span className="text-sm">Q1</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-gray-400 rounded-t" style={{ height: "80px" }}></div>
                  <span className="text-sm">Q2</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-white rounded-t" style={{ height: "140px" }}></div>
                  <span className="text-sm">Q3</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-gray-400 rounded-t" style={{ height: "100px" }}></div>
                  <span className="text-sm">Q4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
