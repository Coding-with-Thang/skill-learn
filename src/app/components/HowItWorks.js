import Image from "next/image";
import courses from "../../../public/courses.png";
import games from "../../../public/games.png";
import redeemRewards from "../../../public/redeem-rewards.png";

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Choose a Course",
      description:
        "Pick a subject and start learning at your own pace! Test your knowledge through fun quizzes to level up.",
      icon: courses,
      iconSize: 100,
    },
    {
      title: "2. Play Games",
      description:
        "Take a load off work by playing games after completing courses.",
      icon: games,
      iconSize: 100,
    },
    {
      title: "3. Earn Rewards",
      description:
        "Get rewarded with points, badges, and a place on the leaderboard.",
      icon: redeemRewards,
      iconSize: 100,
    },
  ];
  return (
    <section id="how-it-works" className="py-16 w-full text-center mx-auto">
      <h2 className="text-3xl font-semibold mb-9 text-[#155d59]">
        How It Works
      </h2>
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex justify-center px-9 border-none outline-none shadow-none mb-[5rem]"
        >
          <div className="flex justify-end w-[100%]">
            <Image
              src={step.icon}
              width={step.iconSize}
              height={step.iconSize}
              alt="Alt"
              className="w-full h-full"
            />
          </div>
          <div className="flex flex-col items-center gap-6 w-full">
            <h4 className="text-[#155d59] flex items-start text-left text-2xl mt-3">
              {step.title}
            </h4>
            <p className="max-w-[40ch] flex items-start text-left text-gray-400">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
