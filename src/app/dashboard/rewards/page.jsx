"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { useRewardStore } from "@/app/store/rewardStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Star, StarOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch";
import AddRewards from '@/app/components/Admin/rewards/addRewards';

export default function RewardsAdminPage() {

  const [showForm, setShowForm] = useState(false);

  const { fetchRewards, rewards, isLoading, updateReward } = useRewardStore();

  const [prize, setPrize] = useState('')
  const [description, setDescription] = useState('')
  const [imageLink, setImageLink] = useState('')
  const [cost, setCost] = useState(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Adding new reward")
  }

  const handleToggleFeatured = async (reward) => {
    try {
      await updateReward(reward.id, { featured: !reward.featured });
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-4xl font-semibold">Rewards Management</h2>


      {!isLoading ? (
        <div className="border border-gray-100 bg-white text-black p-4 mt-10 w-full">
          <Button
            onClick={() => setShowForm(true)}
            className="text-lg font-semibold bg-blue-800 text-white hover:bg-blue-400 hover:text-gray-800">
            + Add Reward
          </Button>

          {showForm && (
            <>
              {/* User Form */}
              <form onSubmit={handleSubmit} className="bg-white mt-5 p-6 shadow-md rounded-lg max-w-lg mx-auto space-y-6 transition duration-100 ease-in-out relative">
                <Button
                  className="flex absolute right-4 top-3 rounded-lg font-bold p-3 hover:bg-blue-900 hover:text-white transition duration-300 ease-in-out"
                  onClick={() => setShowForm(false)}
                >
                  X
                </Button>
                <div>
                  <Label htmlFor="prize" className="block text-sm font-medium text-gray-600">Prize Name</Label>
                  <Input
                    id="prize"
                    type="text"
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-600">Description</Label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>
                <div>
                  <Label htmlFor="cost" className="block text-sm font-medium text-gray-600">Points Required</Label>
                  <Input
                    id="description"
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="imageLink" className="block text-sm font-medium text-gray-600">Image</Label>
                  <Input
                    id="imageLink"
                    type="text"
                    value={imageLink}
                    onChange={(e) => setImageLink(e.target.value)}
                    className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <Label htmlFor="enabled" className="text-sm font-medium text-gray-600">Enabled?</Label>
                  <input
                    id="enabled"
                    type="checkbox"
                    value={enabled}
                    onChange={(prev) => setEnabled(!prev)}
                  />
                </div>
              </form>
            </>
          )}

          <div className="mt-10">
            {/* Table */}
            <Table>
              <TableHeader className="whitespace-nowrap">
                <TableRow>
                  <TableHead className="w-[100px]">Prize</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Image URL</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="whitespace-nowrap">
                {rewards.map((reward) => (
                  <TableRow key={reward.id} className={reward.featured ? "bg-yellow-50" : ""}>
                    <TableCell className="font-semibold">{reward.prize}</TableCell>
                    <TableCell>{reward.description}</TableCell>
                    <TableCell>{reward.cost}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{reward.imageUrl}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${reward.featured
                          ? "text-yellow-600 hover:text-yellow-700"
                          : "text-gray-400 hover:text-gray-500"
                          }`}
                        onClick={() => handleToggleFeatured(reward)}
                      >
                        {reward.featured ? (
                          <Star className="h-5 w-5 fill-current" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="flex gap-2 justify-center">
                      <Dialog>
                        <DialogTrigger>
                          <Button className="bg-blue-800 text-white hover:bg-blue-400 hover:text-gray-800">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <AddRewards />
                      </Dialog>
                      <Button className="bg-red-800 text-white hover:bg-red-400 hover:text-gray-800">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
