"use client"

import Link from "next/link";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import Gifts from "../../../public/gifts.png"
import Rewards from "../../../public/rewards22.jpeg"
import Play from "../../../public/play.jpg"
import Break from "../../../public/15break.jpg"
import Lunch from "../../../public/lunch.jpg"
import FlyingPie from "../../../public/flying-pie.jpg"
import { Circle, CircleDashed, TerminalSquareIcon } from "lucide-react";

export default function RewardsPage() {

  const prizes = [
    {
      prizeTitle: "5-minute Play Session",
      prizeDesc: "Play the games available under Games for 5 minutes  (*manager approved required)",
      prizePts: 50,
      prizeImg: Play
    },
    {
      prizeTitle: "15-minute Break",
      prizeDesc: "Redeem an additional 15-minute break (*manager approved required)",
      prizePts: 150,
      prizeImg: Break
    },
    {
      prizeTitle: "Free Lunch",
      prizeDesc: "Redeem a free lunch from SkipTheWalkIn (value $10)",
      prizePts: 500,
      prizeImg: Lunch
    },
    {
      prizeTitle: "Flying Pie",
      prizeDesc: "Select a manager and throw a pie at their face!",
      prizePts: 10000,
      prizeImg: FlyingPie
    }
  ]

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen">
      <div className="flex flex-col gap-1 items-center justify-center w-full h-[300px] bg-green-300 text-gray-100 relative">
        <Image
          src={Gifts}
          height={300}
          width={300}
          alt="gifts"
          className="absolute right-9"
        />
        <h1 className="text-6xl font-bold drop-shadow-lg mb-2">Get Rewards</h1>
        <h2 className="text-2xl font-bold text-green-600 uppercase">
          Unlock prizes and redeem rewards from a wide variety of choices!
        </h2>
      </div>

      <div className="flex p-[2rem] w-full min-h-[50rem] bg-gray-50 text-gray-900">
        <div className="p-9">
          <h1 className="text-6xl font-bold text-black mb-2">Redeem prizes</h1>
          <h2 className="text-lg font-semibold text-black">
            Points you earn daily completing training and playing games can be redeemed for amazing prizes!
          </h2>
        </div>
        <Image
          src={Rewards}
          height={20}
          width={600}
          alt="Reward"
        />
      </div>
      <div className="flex flex-col w-full justify-center items-center bg-gray-50">
        <h1 className="flex text-5xl my-7 justify-center">Daily Streak</h1>
        <div className="flex gap-3 items-center mb-9">
          <div className="">
            <h1 className="rounded-[100%] bg-yellow-300 border-8 border-y-yellow-600 text-6xl py-3 px-6 text-white">3</h1>
          </div>
          <div className="flex flex-col mx-4">
            <div className="flex gap-6">
              <Circle />
              <CircleDashed />
              <Circle />
              <CircleDashed />
              <Circle />
              <CircleDashed />
              <Circle />
              <CircleDashed />
            </div>
            <p className="max-w-[45ch] mt-3">Nice work! You've reached max points 3 days in a row! You're 2 days away from unlocking your 500-point bonus.</p>
          </div>
          <div className="text-4xl"><TerminalSquareIcon /></div>

        </div>

        <h1 className="flex text-5xl my-7 justify-center">Featured Reward</h1>
        <div className="mb-9">
          <Card className="flex min-w-[40ch] hover:scale(1.2)">
            <CardHeader className="">
              <p className="flex justify-end text-2xl">
                <span className="text-yellow-500 mr-1">+</span>
                {prizes[3].prizePts}</p>
              <Image
                className=""
                src={prizes[3].prizeImg}
                width={340}
                height={150}
                alt={prizes[3].prizeTitle}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-2 items-start">
              <h4 className="pt-7 text-5xl font-semibold text-gray-900">{prizes[3].prizeTitle}</h4>
              <p className="text-3xl">{prizes[3].prizeDesc}</p>
            </CardContent>
            <CardFooter className="flex items-end justify-end pr-3">
              <Button className="text-xl rounded-lg">Redeem</Button>
            </CardFooter>
          </Card>
        </div>

        <h1 className="flex text-5xl my-7 justify-center">All Rewards</h1>
        <div className="p-3 mb-[30rem] flex gap-7 mb-9">
          {prizes.map((prize, index) => (
            <Card key={index} className="max-w-[40ch]">
              <CardHeader className="">
                <p className="flex justify-end text-2xl">
                  <span className="text-yellow-500 mr-1">+</span>
                  {prize.prizePts}</p>
                <Image
                  className=""
                  src={prize.prizeImg}
                  width={340}
                  height={150}
                  alt={prize.prizeTitle}
                />
              </CardHeader>
              <CardContent className="flex flex-col gap-2 items-start">
                <h4 className="mx-auto font-semibold text-gray-900">{prize.prizeTitle}</h4>
                <p>{prize.prizeDesc}</p>
              </CardContent>
              <CardFooter>
                <Button className="font-bold">Redeem</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div >
  );
}
