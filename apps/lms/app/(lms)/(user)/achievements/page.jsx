"use client"

import React from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Zap,
  BookOpen,
  GraduationCap,
  Lock,
  Gamepad2,
  Brain,
  Layout,
  Flame,
  Info,
  Sparkles,
  Telescope,
  Rocket,
  ShieldCheck,
  Filter,
  Award,
  Star,
  Share2,
  Calendar,
} from 'lucide-react'
import { Button } from "@skill-learn/ui/components/button"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@skill-learn/ui/components/hover-card"
import BreadCrumbCom from "@/components/shared/BreadCrumb"
import Link from 'next/link'

const categories = [
  { id: 'milestones', name: 'Learning Milestones', color: '#06b6d4', progress: '3 / 8', icon: GraduationCap },
  { id: 'quiz', name: 'Quiz Master', color: '#f59e0b', progress: '5 / 12', icon: Brain },
  { id: 'flashcards', name: 'Flashcard Expert', color: '#3b82f6', progress: '1 / 10', icon: Layout },
  { id: 'games', name: 'Game Legends', color: '#ec4899', progress: '0 / 6', icon: Gamepad2 }
]

const achievements = [
  // Learning Milestones
  {
    id: 'early-adopter',
    title: 'Early Adopter',
    description: 'Joined the platform during the beta launch.',
    story: "You were among the first 1,000 pioneers to join Skill-Learn. Your early feedback helped shape the system we have today. A true visionary!",
    howToUnlock: "Register your account during the Beta phase.",
    icon: GraduationCap,
    category: 'milestones',
    earnedDate: 'Sep 12, 2023',
    isLocked: false,
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    id: 'fast-reader',
    title: 'Fast Reader',
    description: 'Completed your first course in less than 3 days.',
    story: "Witness the speed of a focused mind! You demolished your first curriculum with surgical precision and blistering pace.",
    howToUnlock: "Complete all lessons in a standard course within 72 hours of starting.",
    icon: BookOpen,
    category: 'milestones',
    earnedDate: 'Oct 05, 2023',
    isLocked: false,
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 'streak-7',
    title: 'Week on Fire',
    description: 'Maintained a 7-day study streak.',
    story: "Consistency is the mother of mastery. For seven sunrises and sunsets, you showed up for your future self. The heat is on!",
    howToUnlock: "Complete at least one learning activity every day for 7 consecutive days.",
    icon: Flame,
    category: 'milestones',
    earnedDate: 'Oct 01, 2023',
    isLocked: false,
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'knowledge-sage',
    title: 'Knowledge Sage',
    description: 'Complete 50 lessons to reach sage status.',
    story: "The path of the sage is long and winding. Though your journey is only beginning, your dedication to the pursuit of truth is evident.",
    howToUnlock: "Reach a total of 50 completed lessons across any course category.",
    icon: Lock,
    category: 'milestones',
    isLocked: true,
  },
  {
    id: 'curiosity-killed-boredom',
    title: 'Curious Mind',
    description: 'Explore 5 different course categories.',
    story: "You don't just stay in your lane; you explore the whole highway. Your multidisciplinary approach makes you a versatile learner.",
    howToUnlock: "Open and view the introduction of courses from 5 unique categories.",
    icon: Telescope,
    category: 'milestones',
    earnedDate: 'Dec 15, 2023',
    isLocked: false,
    color: 'from-teal-400 to-teal-600',
  },

  // Quiz Master
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Earned for scoring 100% on a professional level quiz.',
    story: "Flawless victory! Every question met its match. Your precision in the Professional Digital Marketing quiz set a new standard for excellence.",
    howToUnlock: "Complete any 'Advanced' or 'Professional' level quiz with zero incorrect answers.",
    icon: Brain,
    category: 'quiz',
    earnedDate: 'Oct 20, 2023',
    isLocked: false,
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'quiz-speed',
    title: 'Speed Demon',
    description: 'Complete a quiz in under 30 seconds.',
    story: "Did you even read the questions? Your synapses must be firing at light speed to process and answer that fast. A lightning learner!",
    howToUnlock: "Complete a 10-question quiz in under 30 seconds with at least 80% accuracy.",
    icon: Zap,
    category: 'quiz',
    isLocked: true,
  },
  {
    id: 'steady-hand',
    title: 'Steady Hand',
    description: 'Score 90% or higher on 5 quizzes in a row.',
    story: "Reliability is your middle name. You don't just succeed; you maintain success over the long haul. A pillar of competence.",
    howToUnlock: "Achieve a score of 90%+ on five consecutive quizzes without any breaks.",
    icon: ShieldCheck,
    category: 'quiz',
    earnedDate: 'Nov 12, 2023',
    isLocked: false,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'unshakable',
    title: 'Unshakable',
    description: 'Get a perfect score after 3 failed attempts.',
    story: "Resilience personified. You didn't let failure stop you; you used it as a stepping stone to reach perfection. The ultimate comeback!",
    howToUnlock: "Score 100% on a quiz that you previously failed (below 60%) at least 3 times.",
    icon: Rocket,
    category: 'quiz',
    isLocked: true,
  },

  // Flashcard Expert
  {
    id: 'card-shark',
    title: 'Card Shark',
    description: 'Mastered your first set of 50 flashcards.',
    icon: Layout,
    category: 'flashcards',
    earnedDate: 'Today',
    isLocked: false,
    color: 'from-blue-400 to-blue-600',
    story: "The cards have no secrets from you. You flipped through the 'React Fundamentals' deck like a pro, committing every detail to long-term memory.",
    howToUnlock: "Successfully reach 'Mastered' status for 50 unique flashcards."
  },
  {
    id: 'combo-master',
    title: 'Combo Master',
    description: 'Get 20 correct answers in a row.',
    story: "You found the rhythm. Each flip was a win. You built a chain of knowledge that couldn't be broken. Keep the momentum!",
    howToUnlock: "Achieve a streak of 20 'Got It' or 'Mastered' responses in a single flashcard study session.",
    icon: Lock,
    category: 'flashcards',
    isLocked: true,
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Study flashcards for 1 hour after midnight.',
    story: "While the world sleeps, you grow. These late-night sessions are where the real gains are made. The darkness fuels your focus.",
    howToUnlock: "Maintain an active flashcard study session for 60+ minutes between 12:00 AM and 4:00 AM local time.",
    icon: Sparkles,
    category: 'flashcards',
    earnedDate: 'Jan 02, 2024',
    isLocked: false,
    color: 'from-indigo-600 to-slate-900',
  },

  // Game Legends
  {
    id: 'speed-runner',
    title: 'Speed Runner',
    description: 'Beat the memory game in under 30 seconds.',
    story: "Your pattern recognition is superhuman. You mapped the grid and cleared it before the timer could even catch its breath.",
    howToUnlock: "Complete a 'Large' grid Memory Game in under 30 seconds with 0 mistakes.",
    icon: Lock,
    category: 'games',
    isLocked: true,
  },
  {
    id: 'top-tier',
    title: 'Top Tier',
    description: 'Reach Diamond rank in the global leaderboard.',
    story: "You stand atop the mountain. Thousands look up to your score. You aren't just a player; you are a legend among students.",
    howToUnlock: "Enter the top 1% of the global points leaderboard at the end of a competitive season.",
    icon: Lock,
    category: 'games',
    isLocked: true,
  },
  {
    id: 'social-warrior',
    title: 'Social Warrior',
    description: 'Win 10 head-to-head challenges.',
    story: "Conflict breeds growth. You tested your mettle against your peers and emerged victorious time and time again. Respect earned.",
    howToUnlock: "Win 10 multiplayer 'Battle Mode' quizzes against live opponents.",
    icon: Lock,
    category: 'games',
    isLocked: true,
  }
]

const Badge3D = ({ icon: Icon, color, isLocked, size = "md", achievement }) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-52 h-52 sm:w-64 sm:h-64"
  }

  const iconSize = {
    sm: 20,
    md: 36,
    lg: 80
  }

  const badgeBody = (
    <div className="relative group cursor-pointer">
      {/* 3D Depth Shadow */}
      <div className={`${sizeClasses[size]} rounded-full bg-black/10 absolute top-2 left-0 blur-md transition-all duration-300 group-hover:top-4 group-hover:blur-lg`}></div>

      {/* Main Badge Body */}
      <div className={`${sizeClasses[size]} rounded-full ${isLocked ? 'bg-muted/20 border-2 border-dashed border-border' : `bg-gradient-to-br ${color} ring-4 ring-white/20`} flex items-center justify-center relative shadow-xl transform transition-transform duration-300 group-hover:-translate-y-2 overflow-hidden`}>

        {/* Shine Layer */}
        {!isLocked && (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/40 via-white/0 to-transparent opacity-60"></div>
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-white/20 rotate-45 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="absolute inset-1.5 rounded-full border border-white/30 shadow-inner"></div>
          </>
        )}

        {size === 'lg' ? (
          <div className="flex flex-col items-center z-10">
            <span className="text-white text-7xl sm:text-9xl font-black italic select-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">1st</span>
            <div className="mt-[-10px] bg-sky-300 w-20 h-10 rounded-b-2xl flex items-center justify-center shadow-lg border-t border-sky-200 z-20">
              <div className="w-10 h-5 border-2 border-white/50 rounded-full"></div>
            </div>
          </div>
        ) : (
          <div className={`relative z-10 ${isLocked ? 'bg-card p-3' : 'bg-white/10 backdrop-blur-sm p-4'} rounded-full shadow-inner ${!isLocked && 'border border-white/20'}`}>
            {isLocked ? (
              <Lock size={iconSize[size] / 1.5} className="text-muted-foreground/30" />
            ) : (
              <Icon size={iconSize[size]} className="text-white drop-shadow-lg" />
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {badgeBody}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden rounded-[24px] border-border shadow-2xl">
        <div className={`h-2 w-full bg-gradient-to-r ${isLocked ? 'from-slate-200 to-slate-300' : color}`}></div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-black text-xl uppercase tracking-tight text-foreground">{achievement.title}</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {isLocked ? "Knowledge Objective" : `Earned ${achievement.earnedDate}`}
              </p>
            </div>
            {!isLocked && (
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3" /> Details
              </p>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                {achievement.description}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
                {isLocked ? <Target className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                {isLocked ? "Mission" : "The Story"}
              </p>
              <p className="text-sm italic font-medium text-foreground leading-relaxed">
                {isLocked ? achievement.howToUnlock : achievement.story}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Badge className={`${isLocked ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-600 dark:text-green-400'} border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest`}>
              {isLocked ? "Status: Locked" : "Status: Legend Unlocked"}
            </Badge>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8">
        <BreadCrumbCom endtrail="Achievements" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mt-8 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
              Digital Trophy Case
            </h1>
            <p className="text-muted-foreground mt-3 text-xl font-medium">
              Your journey of excellence, immortalized in 3D badges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button variant="outline" className="rounded-full bg-card shadow-sm border-border h-12 px-6 font-bold hover:bg-muted transition-all">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              All Categories
            </Button>
            <Link href="/leaderboard">
              <Button className="rounded-full bg-cyan-500 hover:bg-cyan-600 text-white border-none shadow-xl shadow-cyan-500/20 h-12 px-8 font-bold transition-all hover:scale-105 active:scale-95">
                <Award className="w-4 h-4 mr-2" />
                View Ranking
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Latest Achievement - Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-14 relative overflow-hidden rounded-[48px] bg-card border border-border shadow-2xl dark:shadow-none dark:border-white/5"
        >
          {/* Abstract light effects - adjusted for theme */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-cyan-500/5 dark:bg-cyan-400/5 blur-3xl rotate-12 transform translate-x-1/4"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 dark:bg-primary/5 rounded-full blur-3xl"></div>

          <div className="relative p-10 md:p-16 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-shrink-0 animate-float">
              <Badge3D
                size="lg"
                color="from-cyan-400 to-cyan-600"
                achievement={achievements.find(a => a.id === 'early-adopter')} // Using dummy for hero
              />
            </div>

            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-[0.2em] shadow-inner">
                  <Star className="w-3 h-3 mr-2 fill-current" />
                  Latest Achievement
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-foreground leading-[1.1]">
                  First Record Breaker
                </h2>
                <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl font-medium">
                  A legendary beginning! You earned this for setting your very first personal best in the Flashcard Mastery challenge. This is the first of many milestones.
                </p>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-5">
                <Button className="rounded-full bg-foreground text-background hover:opacity-90 px-10 h-14 font-extrabold text-lg shadow-2xl transition-all">
                  <Share2 className="w-5 h-5 mr-3" />
                  Share to Team
                </Button>
                <div className="flex items-center px-8 h-14 rounded-full border border-border bg-background/50 backdrop-blur-md text-muted-foreground shadow-sm">
                  <Calendar className="w-5 h-5 mr-3 text-cyan-500" />
                  <span className="text-base font-bold">Earned Oct 24, 2023</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="mt-28 space-y-32">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-6">
                  <div className="w-3 h-12 rounded-full shadow-lg" style={{ backgroundColor: category.color }}></div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <category.icon className="w-4 h-4" style={{ color: category.color }} />
                      <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest leading-none">
                        Progress: {category.progress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-12">
                {achievements
                  .filter(a => a.category === category.id)
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center text-center group"
                    >
                      <Badge3D
                        achievement={achievement}
                        icon={achievement.icon}
                        color={achievement.color}
                        isLocked={achievement.isLocked}
                        size="md"
                      />
                      <div className="mt-6 space-y-1 transform transition-transform group-hover:translate-y-1 font-sans">
                        <h4 className={`font-black text-base uppercase tracking-tight ${achievement.isLocked ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                          {achievement.title}
                        </h4>
                        {!achievement.isLocked && achievement.earnedDate && (
                          <div className="px-3 py-1 bg-muted rounded-full inline-block">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{achievement.earnedDate}</p>
                          </div>
                        )}
                        {achievement.isLocked && (
                          <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.2em]">Locked</p>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(2deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}