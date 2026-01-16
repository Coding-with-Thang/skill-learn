"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  Share2,
  Bookmark
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Badge } from "@skill-learn/ui/components/badge";
import { Separator } from "@skill-learn/ui/components/separator";

const JOB_DETAILS = {
  "senior-frontend-engineer": {
    title: "Senior Frontend Engineer (React)",
    department: "Engineering",
    location: "Remote",
    salary: "$140k - $180k",
    type: "Full-time",
    description: "We are looking for a Senior Frontend Engineer to help us build the next generation of interactive education tools. You will be responsible for building and maintaining our React-based web applications, ensuring high performance and a great user experience. At Skill-Learn, we are on a mission to gamify knowledge and make learning an addictive, joyful process for everyone.",
    responsibilities: [
      "Lead the development of new features and components for our flagship LMS platform.",
      "Collaborate with designers to implement beautiful, responsive, and accessible user interfaces.",
      "Optimize applications for maximum speed and scalability.",
      "Mentor junior and mid-level engineers through code reviews and pair programming.",
      "Participate in architectural decisions and help shape the future of our frontend stack."
    ],
    requirements: [
      "5+ years of experience with React and modern JavaScript.",
      "Strong understanding of CSS-in-JS, Tailwind CSS, and responsive design.",
      "Experience with TypeScript and modern state management (Zustand, React Query).",
      "Familiarity with server-side rendering (Next.js) and build tools (Vite, Webpack).",
      "Passion for building educational products and a great user experience."
    ],
    benefits: [
      "Competitive salary and equity package.",
      "Remote-first work environment with flexible hours.",
      "$2,000 annual professional development budget.",
      "Comprehensive health, dental, and vision insurance.",
      "Generous parental leave and time off policy."
    ]
  },
  "product-designer": {
    title: "Product Designer (LMS)",
    department: "Product",
    location: "London / Remote",
    salary: "£70k - £95k",
    type: "Full-time",
    description: "We're looking for a Product Designer who is passionate about creating intuitive and engaging learning experiences. You'll work closely with product managers and engineers to define the user journey, create high-fidelity prototypes, and ensure our platform is as beautiful as it is functional.",
    responsibilities: [
      "Create user-centered designs by understanding business requirements and user feedback.",
      "Develop high-fidelity mockups and interactive prototypes using Figma.",
      "Maintain and evolve our design system to ensure consistency across the application.",
      "Conduct user research and usability testing to validate design decisions.",
      "Work closely with engineers to ensure designs are implemented to a high standard."
    ],
    requirements: [
      "4+ years of experience in product design for SaaS or B2B applications.",
      "Strong portfolio demonstrating user-centric design principles and high visual craft.",
      "Expert proficiency in Figma and prototyping tools.",
      "Experience working in an agile environment and collaborating with cross-functional teams.",
      "Strong communication skills and ability to articulate design rationale."
    ],
    benefits: [
      "Competitive salary and equity package.",
      "Remote-friendly work arrangements.",
      "Top-of-the-line design equipment and software.",
      "Private medical insurance and wellness perks.",
      "Collaborative and creative work environment."
    ]
  }
};

export default function JobDescriptionPage() {
  const { jobId } = useParams();

  // Default to a generic job if jobId doesn't match
  const job = JOB_DETAILS[jobId] || {
    title: "Modern Job Role",
    department: "General",
    location: "Remote",
    salary: "Competitive",
    type: "Full-time",
    description: "Join our growing team and help us build the future of education.",
    responsibilities: ["Contribute to our core product", "Collaborate with talented teammates", "Help us scale our impact"],
    requirements: ["Passionate about learning", "3+ years of relevant experience", "Excellent communication skills"],
    benefits: ["Great culture", "Growth opportunities", "Competitive compensation"]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar / Navigation */}
      <div className="border-b border-slate-100 py-4 bg-slate-50/30">
        <div className="container px-4 mx-auto">
          <Link href="/careers" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all roles
          </Link>
        </div>
      </div>

      <div className="container px-4 mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 px-3">
                  {job.department}
                </Badge>
                <div className="flex items-center text-sm text-slate-500 gap-1.5 ml-auto md:ml-0">
                  <Calendar className="w-4 h-4" />
                  Posted 2 days ago
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
                {job.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Location</p>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    {job.location}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Type</p>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <Briefcase className="w-4 h-4 text-teal-600" />
                    {job.type}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Salary</p>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <DollarSign className="w-4 h-4 text-teal-600" />
                    {job.salary}
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">About the Role</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-10">
                  {job.description}
                </p>

                <h3 className="text-xl font-bold text-slate-900 mb-6">Responsibilities</h3>
                <ul className="space-y-4 mb-10 list-none p-0">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-slate-900 mb-6">Requirements</h3>
                <ul className="space-y-4 mb-10 list-none p-0">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-slate-900 mb-6">Benefits</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 list-none p-0">
                  {job.benefits.map((item, i) => (
                    <li key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm font-medium">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Action */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-100/50 sticky top-24">
              <Link href={`/careers/${jobId}/apply`}>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-14 rounded-2xl mb-4 group shadow-lg shadow-teal-100">
                  Apply for this role
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl border-slate-200">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>

              <Separator className="my-8 opacity-50" />

              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Hiring Manager</h4>
                  <p className="text-slate-500">Alex Chen, Head of Engineering</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Typical Process</h4>
                  <p className="text-slate-500 leading-relaxed">
                    1. Intro Call (30m)<br />
                    2. Technical Deep Dive (60m)<br />
                    3. Team Values & Culture (45m)<br />
                    4. Final Decision
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
