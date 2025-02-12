import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import quiz from "../../../public/quiz.png";

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Choose a Course",
      description:
        "Pick a subject and start learning at your own pace! Test your knowledge through fun quizzes to level up.",
      icon: quiz,
    },
    {
      title: "2. Play Games",
      description:
        "Take a load off work by playing games after completing courses.",
      icon: quiz,
    },
    {
      title: "3. Earn Rewards",
      description:
        "Get rewarded with points, badges, and a place on the leaderboard.",
      icon: quiz,
    },
  ];
  return (
    <section id="how-it-works" className="py-16">
      <div className=" mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-9 text-[#155d59]">
          How It Works
        </h2>
        {steps.map((step, index) => (
          <Card
            key={index}
            className="flex border-none outline-none shadow-none mb-[5rem]"
          >
            <CardHeader className="flex w-[50%]">
              <Image
                src={step.icon}
                width={100}
                height={100}
                alt="Alt"
                className=""
              />
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-6 border border-3 border-black">
              <h4 className="text-[#155d59] text-3xl mt-3">{step.title}</h4>
              <p className="max-w-[40ch] flex items-start text-gray-600">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
