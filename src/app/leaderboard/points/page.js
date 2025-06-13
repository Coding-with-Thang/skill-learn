import LifetimePointsLeaderboard from "@/app/components/Leaderboard/LifetimePointsLeaderboard";
import BreadCrumbCom from "@/app/components/BreadCrumb";

export default function PointsLeaderboardPage() {
  return (
    <div className="container mx-auto p-4">
      <div>
        <BreadCrumbCom endtrail="Lifetime Points Leaderboard" />
      </div>
      <h1 className="text-2xl font-bold mb-6">Lifetime Points Leaderboard</h1>
      <div className="flex flex-col gap-8">
        <div className="flex justify-center gap-4 py-8">
          <div className="order-2 mt-0">
            <div className="relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                1
              </div>
              <LifetimePointsLeaderboard limit={1} className="w-32 h-32" />
            </div>
          </div>
          <div className="order-1 mt-8">
            <div className="relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                2
              </div>
              <LifetimePointsLeaderboard
                limit={2}
                skip={1}
                className="w-28 h-28"
              />
            </div>
          </div>
          <div className="order-3 mt-12">
            <div className="relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-700 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                3
              </div>
              <LifetimePointsLeaderboard
                limit={3}
                skip={2}
                className="w-24 h-24"
              />
            </div>
          </div>
        </div>
        <LifetimePointsLeaderboard skip={3} />
      </div>
    </div>
  );
}
