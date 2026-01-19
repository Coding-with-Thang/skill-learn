"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Globe,
  BookOpen,
  Heart,
  ArrowRight,
  ChevronRight,
  Filter
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Input } from "@skill-learn/ui/components/input";
import { Badge } from "@skill-learn/ui/components/badge";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { useRouter } from "next/navigation";

const JOBS = [
  {
    id: "senior-frontend-engineer",
    title: "Senior Frontend Engineer (React)",
    department: "Engineering",
    location: "San Francisco / Remote",
    type: "Full-time",
    isNew: true,
  },
  {
    id: "product-designer",
    title: "Product Designer (LMS)",
    department: "Product",
    location: "London / Remote",
    type: "Full-time",
    isNew: false,
  },
  {
    id: "strategic-account-executive",
    title: "Strategic Account Executive",
    department: "Sales",
    location: "Vancouver / Remote",
    type: "Full-time",
    isNew: true,
  },
  {
    id: "technical-content-marketer",
    title: "Technical Content Marketer",
    department: "Marketing",
    location: "Toronto / Remote",
    type: "Full-time",
    isNew: false,
  },
];

const CULTURE_PERKS = [
  {
    icon: <Globe className="w-6 h-6 text-teal-600" />,
    title: "Remote-First Culture",
    description: "We focus on outcomes, not hours. Work from anywhere in the world with a distributed team of experts."
  },
  {
    icon: <BookOpen className="w-6 h-6 text-teal-600" />,
    title: "Continuous Learning",
    description: "$2,000 annual budget for books, courses, conferences, or any professional growth initiative."
  },
  {
    icon: <Heart className="w-6 h-6 text-teal-600" />,
    title: "Health & Wellness",
    description: "Comprehensive private medical insurance for you and your family, plus premium gym memberships."
  }
];

export default function CareersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  const filteredJobs = JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All Departments" || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = ["All Departments", ...new Set(JOBS.map(job => job.department))];

  const scrollToOpenings = () => {
    const element = document.getElementById('openings');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-teal-50/50 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-teal-200 text-teal-700 bg-teal-50 px-4 py-1">
              Work with us
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Help Us Revolutionize How <br />
              the <span className="text-teal-600">World Learns</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
              Join a remote-first team building the next generation of interactive education tools for the world&apos;s leading enterprises.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 shadow-lg shadow-teal-200"
                onClick={scrollToOpenings}
              >
                View Openings
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 bg-white" onClick={() => router.push('/about')}>
                Our Mission
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Culture & Perks Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Culture & Perks</h2>
            <p className="text-slate-600">Everything you need to do your best work, wherever you are.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CULTURE_PERKS.map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-slate-100 hover:border-teal-100 transition-colors shadow-sm hover:shadow-md group">
                  <CardContent className="pt-8 px-8 pb-8">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {perk.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{perk.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{perk.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="openings" className="py-20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Open Positions</h2>
              <p className="text-slate-600">Join us in shaping the future of enterprise learning.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search roles..."
                  className="pl-10 bg-white border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDept === dept
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/careers/${job.id}`}>
                    <div className="group bg-white border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:border-teal-200 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                            {job.title}
                          </h3>
                          {job.isNew && (
                            <Badge className="bg-teal-500 text-white border-0 uppercase text-[10px]">New</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {job.department}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {job.location}
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" className="group/btn border-slate-200 text-slate-900 group-hover:bg-teal-600 group-hover:border-teal-600 rounded-xl px-6">
                        View Role
                        <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500">No positions found matching your criteria.</p>
                <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedDept("All Departments") }} className="text-teal-600">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Spontaneous Application Section */}
      <section className="py-20 container px-4 mx-auto">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Don&apos;t see a fit?</h2>
            <p className="text-slate-400 text-lg mb-10">
              We&apos;re always looking for talented people who share our passion for education and technology. Send us your resume for future openings.
            </p>
            <Link href="/careers/spontaneous/apply">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full px-10 h-14 group">
                Spontaneous Application
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
