"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
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
    description: "At Skill-Learn, we're not just building another LMS; we're building a gamification engine that transforms how enterprises transfer knowledge. As a Senior Frontend Engineer, you'll be at the forefront of this mission, crafting high-performance, immersive interfaces that make learning an addictive and joyful experience. You'll work on everything from real-time analytics dashboards to complex interactive quiz builders and gamified progress systems, ensuring a seamless experience across our multi-tenant SaaS architecture.",
    responsibilities: [
      "Lead the architectural design and development of complex, interactive frontend features using React and Next.js.",
      "Develop and maintain a robust, accessible component library that powers our gamification engine.",
      "Optimize application performance to ensure sub-second response times for learners in over 50+ countries.",
      "Collaborate deeply with Product and Design to translate ambitious gamification concepts into technical reality.",
      "Mentor mid-level and junior engineers, fostering a culture of technical excellence and continuous learning.",
      "Drive best practices in testing, accessibility (WCAG 2.1), and modern frontend state management."
    ],
    requirements: [
      "5+ years of experience building complex SaaS applications with React, TypeScript, and Next.js.",
      "Expert knowledge of CSS-in-JS, Tailwind CSS, and sophisticated animation libraries like Framer Motion.",
      "Proven experience in optimizing web performance (Core Web Vitals) for high-traffic platforms.",
      "Strong understanding of state management patterns (Zustand, React Query, or Redux).",
      "Experience with visual data representation and charting libraries (Recharts, D3.js).",
      "A passion for UX and a desire to build products that genuinely help people grow."
    ],
    benefits: [
      "Competitive salary and equity in a fast-growing SaaS startup.",
      "100% Remote-first culture with asynchronous-friendly workflows.",
      "$2,000 annual 'Growth Fund' for personal and professional development.",
      "Premium workspace stipend ($1,500 initial setup + $200/mo coworking).",
      "Comprehensive health, dental, and vision insurance for you and your family.",
      "Unlimited PTO with a 3-week minimum mandatory leave policy."
    ]
  },
  "product-designer": {
    title: "Product Designer (LMS)",
    department: "Product",
    location: "London / Remote",
    salary: "£70k - £95k",
    type: "Full-time",
    description: "Design is at the heart of the Skill-Learn experience. We believe that if a learning platform isn't beautiful and intuitive, it won't be used. As our Product Designer, you will define the visual and interactive language of our platform. Your goal is to simplify complex enterprise workflows—like course creation and user management—while infusing the product with the delight of a high-end mobile game. You'll be responsible for the end-to-end design process, from deep user research to high-fidelity prototyping and design system management.",
    responsibilities: [
      "Own the end-to-end design of core platform features, including our AI-powered quiz builder and reward stores.",
      "Collaborate with stakeholders to define product strategy and translate business goals into user-centric designs.",
      "Evolve and scale the Skill-Learn design system, ensuring consistency and visual polish across all touchpoints.",
      "Conduct user interviews and usability testing with our enterprise customers to validate design directions.",
      "Produce high-fidelity mockups, interactive prototypes, and detailed handoff documentation in Figma.",
      "Advocate for accessibility and inclusivity in every pixel we ship."
    ],
    requirements: [
      "4+ years of experience in product design, specifically for SaaS, B2B, or EdTech products.",
      "A stunning portfolio showcasing big-picture thinking and meticulous attention to visual craft.",
      "Mastery of Figma and modern prototyping tools.",
      "Experience designing for complex data-heavy interfaces and dashboards.",
      "Strong communication skills and the ability to articulate design rationale to technical and non-technical teams.",
      "A deep interest in gamification, behavioral psychology, and the future of learning."
    ],
    benefits: [
      "Competitive salary and equity package.",
      "Top-tier design equipment (MacBook Pro + Pro Display XDR or equivalent).",
      "Generous health and wellness benefits, including a monthly fitness stipend.",
      "Remote-friendly culture with occasional team retreats in inspiring locations.",
      "Professional development budget for workshops, books, and design conferences.",
      "Paid parental leave and supportive family-first policies."
    ]
  },
  "strategic-account-executive": {
    title: "Strategic Account Executive",
    department: "Sales",
    location: "New York / Remote",
    salary: "$120k - $160k + OTE",
    type: "Full-time",
    description: "Skill-Learn is scaling rapidly, and we need a world-class Strategic Account Executive to join our mission. You will be responsible for bringing the future of learning to the world's largest organizations. This isn't just about selling a tool; it's about partnering with CHROs and L&D leaders to transform their company culture. You'll manage the full enterprise sales cycle, from prospecting high-value leads to closing six-figure deals and ensuring long-term success. If you're a high-performer who thrives in a fast-paced SaaS environment, we want to talk.",
    responsibilities: [
      "Build and maintain a robust pipeline of enterprise-level accounts through strategic prospecting and networking.",
      "Lead high-impact product demonstrations that highlight the unique ROI of Skill-Learn's gamification features.",
      "Navigate complex organizational structures to identify key stakeholders and decision-makers.",
      "Manage end-to-end contract negotiations, ensuring win-win outcomes for Skill-Learn and our customers.",
      "Collaborate with the Product team to relay market feedback and influence the future roadmap.",
      "Consistently exceed quarterly and annual revenue targets while maintaining high CRM hygiene."
    ],
    requirements: [
      "5+ years of experience in enterprise SaaS sales, ideally within the HR Tech or EdTech space.",
      "Proven track record of closing $100k+ ACV deals with Fortune 500 companies.",
      "Exceptional communication, presentation, and relationship-building skills.",
      "Ability to thrive in an early-stage, fast-moving environment with high autonomy.",
      "Experience using modern sales stacks (Salesforce, Apollo, Gong, LinkedIn Sales Navigator).",
      "A consultive approach to selling and a passion for helping organizations solve complex people problems."
    ],
    benefits: [
      "Highly competitive base salary + uncapped commission structure.",
      "Significant equity stake in a high-growth SaaS business.",
      "A seat at the table to help build the sales culture of the company.",
      "Premium health, life, and disability insurance.",
      "Annual President's Club trip for top performers (past trips: Japan, Iceland).",
      "Flexible work arrangements and a dedicated sales development budget."
    ]
  },
  "technical-content-marketer": {
    title: "Technical Content Marketer",
    department: "Marketing",
    location: "Remote",
    salary: "$90k - $130k",
    type: "Full-time",
    description: "Skill-Learn is a product-led company, and we need a Technical Content Marketer who can bridge the gap between deep engineering concepts and compelling marketing narratives. You'll be responsible for telling the story of Skill-Learn—how our tech works, why gamification is mathematically superior to traditional teaching, and how our customers are winning. From technical blog posts and whitepapers to case studies and community engagement, you'll be the voice of our product. You should be equally comfortable talking to a CTO about our API as you are talking to a Head of L&D about learning retention.",
    responsibilities: [
      "Develop and execute a high-impact content strategy that positions Skill-Learn as the thought leader in EdTech.",
      "Write technical blog posts, whitepapers, and guides that simplify complex SaaS and gamification concepts.",
      "Collaborate with the Engineering team to produce developer-focused content and documentation updates.",
      "Produce data-driven case studies that showcase the real-world impact our platform has on enterprise teams.",
      "Manage our social media presence (LinkedIn, Twitter) and engage with our growing community of educators.",
      "Optimize all content for SEO to drive organic growth and product-led signups."
    ],
    requirements: [
      "4+ years of experience in content marketing or technical writing for a SaaS or developer-focused product.",
      "Ability to translate complex technical jargon into clear, engaging, and persuasive copy.",
      "Strong understanding of SEO best practices and content distribution strategies.",
      "Experience working with data and analytics to prove the effectiveness of your content.",
      "A portfolio of published work that demonstrates both technical depth and marketing flair.",
      "Curiosity about the future of AI, gamification, and digital education."
    ],
    benefits: [
      "Competitive salary and performance-based bonuses.",
      "Remote-first work environment with a focus on deep work and flow state.",
      "Budget for creative tools (Adobe Creative Cloud, High-end microphones, etc.).",
      "Annual learning allowance to attend marketing and writing conferences.",
      "Collaborative, egoless environment where your ideas carry real weight.",
      "Flexible hours and a culture that respects your time off."
    ]
  }
};

export default function JobDescriptionPage() {
  const params = useParams();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;

  // Default to a generic job if jobId doesn't match
  const job = (JOB_DETAILS as Record<string, typeof JOB_DETAILS[keyof typeof JOB_DETAILS]>)[jobId ?? ""] || {
    title: "Future Leader at Skill-Learn",
    department: "Growth",
    location: "Global / Remote",
    salary: "Competitive with Equity",
    type: "Full-time",
    description: "Even if you don't see the perfect role listed, we're always looking for exceptional talent to join our mission. Skill-Learn is growing rapidly, and we need builders, thinkers, and explorers who are passionate about the future of education. If you believe you can help us revolutionize how the world learns, we want to hear from you.",
    responsibilities: [
      "Bring your unique expertise to a high-growth, remote-first SaaS company.",
      "Collaborate across departments to solve complex problems in digital education.",
      "Help shape the future of our gamification and interactive learning tools.",
      "Foster a culture of innovation, radical transparency, and continuous growth."
    ],
    requirements: [
      "Profound passion for education technology and behavioral psychology.",
      "Record of excellence in your previous roles, regardless of the industry.",
      "High level of autonomy and a startup-ready 'get things done' mindset.",
      "Excellent communication skills and the ability to work asynchronously."
    ],
    benefits: [
      "Competitive compensation and early-stage equity.",
      "Flexible work-from-anywhere policy.",
      "Comprehensive global healthcare coverage.",
      "Generous annual learning and professional development budget."
    ]
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

              <h1 className="text-3xl md:text-brand-teal font-bold text-slate-900 mb-6 font-display">
                {job.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 p-6 bg-slate-50 rounded-4xl border border-slate-100">
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
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-14 rounded-4xl mb-4 group shadow-lg shadow-teal-100">
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
