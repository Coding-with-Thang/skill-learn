import Image from "next/image";
import { useState } from "react";
import courses from "../../../../public/courses.png";
import games from "../../../../public/games.png";
import redeemRewards from "../../../../public/redeem-rewards.png";

export default function HowItWorks() {
  const [enlarged, setEnlarged] = useState(null);
  const steps = [
    {
      title: "Choose a Course",
      description:
        "Pick a subject and start learning at your own pace! Test your knowledge through fun quizzes to level up.",
      icon: courses,
    },
    {
      title: "Play Games",
      description:
        "Take a load off work by playing games after completing courses.",
      icon: games,
    },
    {
      title: "Earn Rewards",
      description:
        "Get rewarded with points, badges, and a place on the leaderboard.",
      icon: redeemRewards,
    },
  ];
  return (
    <section
      id="how-it-works"
      className="py-12 w-full flex flex-col items-center bg-white"
    >
      <h2 className="text-2xl md:text-3xl font-semibold mb-12 text-primary text-center">
        How It Works
      </h2>
      <div className="flex flex-col md:flex-row md:justify-center gap-10 md:gap-12 w-full max-w-5xl">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center bg-white rounded-2xl shadow-xl px-6 py-10 md:px-8 md:py-12 flex-1 min-w-[220px] max-w-xs mx-auto md:mx-0"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg border-4 border-white">
                {index + 1}
              </div>
            </div>
            <div className="mt-10 mb-6 flex items-center justify-center">
              <button
                type="button"
                aria-label={`Enlarge ${step.title} image`}
                className="focus:outline-none"
                onClick={() => setEnlarged(index)}
              >
                <Image
                  src={step.icon}
                  width={160}
                  height={160}
                  alt={step.title}
                  className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 focus:scale-105"
                  priority
                />
              </button>
            </div>
            <h4 className="text-primary text-xl md:text-2xl font-bold text-center mb-3">
              {step.title}
            </h4>
            <p className="text-gray-500 text-base md:text-lg text-center">
              {step.description}
            </p>
          </div>
        ))}
      </div>
      {/* Modal for enlarged image */}
      {enlarged !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setEnlarged(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-4 md:p-8 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              aria-label="Close enlarged image"
              onClick={() => setEnlarged(null)}
            >
              &times;
            </button>
            <Image
              src={steps[enlarged].icon}
              width={400}
              height={400}
              alt={steps[enlarged].title}
              className="w-[80vw] max-w-xs md:max-w-md lg:max-w-lg h-auto object-contain"
              priority
            />
            <div className="mt-4 text-primary text-lg md:text-xl font-bold text-center">
              {steps[enlarged].title}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
