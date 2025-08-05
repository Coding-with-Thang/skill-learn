import Image from "next/image";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import quiz from "../../../../public/quiz.png"
import progressTracking from "../../../../public/progress-tracking.png"
import leaderboard from "../../../../public/leaderboard.png"
import multiSource from "../../../../public/multi-source.png"
import customize from "../../../../public/customize.png"
import uptime from "../../../../public/uptime.png"

export default function Features() {

  const featureSet = [
    {
      title: "Interactive Quizzes",
      description: "Test your knowledge with engaging quizzes that challenge your skills in real-time.",
      icon: quiz
    },
    {
      title: "Progress Tracking",
      description: "Track your progress and earn badges as you improve your knowledge.",
      icon: progressTracking
    },
    {
      title: "Leaderboards",
      description: "Compete with others and climb the ranks as you become an expert!",
      icon: leaderboard
    },
    {
      title: "MULTIPLE TYPES OF CONTENT",
      description: "The platform allows synchronous and asynchronous content. Documents, videos, webinars, certificates, badges, and more can be integrated. You can use our questionnaire tool to create surveys and exams within the platform.",
      icon: multiSource
    },
    {
      title: "A PLATFORM THAT REPRESENTS YOU",
      description: "Our blank label platform allows you customize the training, achievements and rewards to best fit your agents",
      icon: customize
    },
    {
      title: "24 Hour Accessibly & AND FUN LEARNING",
      description: "Test your knowledge with engaging quizzes that challenge your skills in real-time.",
      icon: uptime
    }
  ]

  return (
    <section id="features" className="py-16 text-foreground">
      <div className="max-w-7xl mx-auto text-center px-4 lg:px-4">
        <h2 className="text-3xl font-semibold">Discover your training activities with ease and efficiency with Skill-Learn</h2>
        <p className="mt-4 mb-9 text-xl text-muted-foreground">Skill-Learn is a learning platform that enables agents to unlock their learning potential with our gamified approach.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureSet.map((feature, index) => (
            <Card key={index} className="rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-normal">
              <CardHeader className="flex items-center">
                <Image
                  src={feature.icon}
                  width={100}
                  height={100}
                  alt="Alt"
                  className=""
                />
              </CardHeader>
              <CardContent className="text-primary font-bold uppercase">
                <h4>{feature.title}</h4>
              </CardContent>
              <CardFooter className="text-muted-foreground">{feature.description}</CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section >
  );
}