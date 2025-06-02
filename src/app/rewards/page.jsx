"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Circle, Ellipsis, Gift } from "lucide-react";
import { useRewardStore } from "@/app/store/rewardStore";
import { usePointsStore } from "@/app/store/pointsStore";
import Gifts from "../../../public/gifts.png"
import Chest from "../../../public/chest.png"
import ChickenDance from "../../../public/chicken-dance.jpg"
import Loader from "../components/loader";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RewardsPage() {

  const { fetchRewards, fetchRewardHistory, rewards, rewardHistory, isLoading, redeemReward } = useRewardStore();
  const { points, fetchPoints } = usePointsStore();

  useEffect(() => {
    fetchRewards();
    fetchPoints();
    fetchRewardHistory();
  }, [fetchRewards, fetchPoints, fetchRewardHistory]);

  const prizes = [
    {
      prizeTitle: "Chicken Dance",
      prizeDesc: "Sara does the chicken dance x3!",
      prizePts: 50000,
      prizeImg: ChickenDance
    }
  ]

  const handleRedeem = async (reward) => {
    if (points < reward.cost) {
      toast.error("You don't have enough points for this reward");
      return;
    }

    const success = await redeemReward(reward.id);
    if (success) {
      // Refresh rewards list
      fetchRewards();
    }
  };

  return (
    <div className="flex flex-col items-center justify-items-center">
      <div className="flex flex-col gap-1 items-center justify-center w-full h-[300px] bg-green-400 bg-linear-to-br from-green-500 to-yellow-200 text-gray-100 relative">
        <Image
          src={Gifts}
          height={300}
          width={300}
          alt="gifts"
          className="absolute right-9"
        />
        <h1 className="text-6xl font-bold mb-2" style={{ textShadow: '#000 1px 0 5px' }}>Get Rewards</h1>
        <h2 className="text-2xl font-bold text-green-600 uppercase">
          Unlock prizes and redeem rewards from a wide variety of choices!
        </h2>
      </div>

      <div className="flex p-[2rem] w-full bg-gray-50 text-gray-900">
        <div className="p-9">
          <h1 className="text-6xl font-bold text-black mb-2">Redeem prizes</h1>
          <h2 className="text-lg font-semibold text-black">
            Points you earn by completing training courses and playing games can be redeemed for amazing prizes!
          </h2>
        </div>
        {/* <Image
          src={Rewards}
          width={40}
          alt="Reward"
        /> */}
      </div>
      <div className="flex flex-col w-full justify-center items-center bg-white border border-gray-200 shadow-xs rounded-lg">
        <h1 className="flex text-5xl my-7 justify-center">Daily Streak</h1>
        <div className="flex gap-3 items-center justify-center mb-9">
          <div className="flex flex-col items-center">
            <h1 className="rounded-[100%] bg-yellow-300 border-8 border-y-yellow-600 text-6xl py-3 px-6 text-white">0</h1>
            <p className="text-lg font-semibold">Current Streak</p>
          </div>
          <div className="flex flex-col mx-4">
            <div className="flex gap-6 justify-center">
              <Circle />
              <Ellipsis />
              <Circle />
              <Ellipsis />
              <Circle />
              <Ellipsis />
              <Circle />
            </div>
            <p className="max-w-[45ch] mt-3 text-lg">Nice work! <strong>5 days away </strong> from unlocking your 500-point bonus.</p>
          </div>
          <div>
            <Image
              src={Chest}
              width={90}
              height={90}
              alt="Rewards"
            />
            <h4 className="text-lg font-semibold">Streak Bonus</h4>
          </div>
        </div>

        <h1 className="flex text-5xl my-7 justify-center">Featured Reward</h1>
        <div className="mb-9">
          <Card className="flex min-w-[40ch] hover:scale(1.2)">
            <CardHeader className="">
              <Image
                className=""
                src={prizes[0].prizeImg}
                width={340}
                height={150}
                alt={prizes[0].prizeTitle}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-2 items-start">
              <h4 className="pt-7 text-5xl font-semibold text-gray-900">{prizes[0].prizeTitle}</h4>
              <p className="text-3xl">{prizes[0].prizeDesc}</p>
              <p className="flex justify-end text-4xl mt-3">
                <span className="text-yellow-500 mr-1">+</span>
                {prizes[0].prizePts}</p>
            </CardContent>
            <CardFooter className="flex items-end justify-end pr-3">
              <Button className="text-xl rounded-lg">Redeem</Button>
            </CardFooter>
          </Card>
        </div>

        <h1 className="flex text-5xl my-7 justify-center">All Rewards</h1>
        {!isLoading ?
          <div className="p-3 mb-[30rem] flex gap-7">
            {rewards.map((prize, index) => (
              <Card key={index} className="max-w-[40ch]">
                <CardHeader className="h-[400px]">
                  <p className="flex justify-end text-2xl">
                    <span className="text-yellow-500 mr-1">+</span>
                    {prize.cost}</p>
                  <Image
                    className=""
                    src={prize.imageUrl}
                    width={340}
                    height={150}
                    alt={prize.prize}
                  />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 items-start">
                  <h4 className="mx-auto font-semibold text-gray-900">{prize.prize}</h4>
                  <p>{prize.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="font-bold"
                    onClick={() => handleRedeem(prize)}
                    disabled={points < prize.cost || isLoading}
                  >
                    {isLoading ? "Processing..." : "Redeem"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          :
          <Loader />
        }
      </div>

      <div className="w-full bg-white border border-gray-200 shadow-xs rounded-lg px-8 mb-20">
        <h1 className="flex text-5xl my-7 justify-center">Redemption History</h1>
        {!isLoading ? (
          rewardHistory.length > 0 ? (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50/50">
                    <TableHead className="py-4 text-base font-semibold">Prize</TableHead>
                    <TableHead className="text-base font-semibold">Points</TableHead>
                    <TableHead className="text-base font-semibold">Status</TableHead>
                    <TableHead className="text-base font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardHistory.map((redemption) => (
                    <TableRow
                      key={redemption.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          {redemption.reward.imageUrl && (
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-gray-100 shadow-sm">
                              <Image
                                src={redemption.reward.imageUrl}
                                fill
                                style={{ objectFit: 'cover' }}
                                alt={redemption.reward.prize}
                                className="transition-transform hover:scale-110"
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold text-lg text-gray-900">
                              {redemption.reward.prize}
                            </p>
                            <p className="text-sm text-gray-500 max-w-[30ch]">
                              {redemption.reward.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 font-bold text-lg">⭐</span>
                          <span className="font-semibold text-lg">
                            {redemption.pointsSpent.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`
                          px-4 py-2 rounded-full text-sm font-medium
                          ${redemption.redeemed
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }
                        `}>
                          {redemption.redeemed ? "Fulfilled" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(redemption.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(redemption.createdAt), "h:mm a")}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mb-10">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-gray-100 p-3">
                  <Gift className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  No Rewards Redeemed Yet
                </h3>
                <p className="text-gray-500 max-w-[40ch] text-center">
                  Complete quizzes and earn points to redeem exciting rewards!
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        )}
      </div>
    </div >
  );
}
