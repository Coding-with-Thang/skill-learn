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
export default function RewardsAdminPage() {

  const [showForm, setShowForm] = useState(false);

  const { fetchRewards, rewards, isLoading } = useRewardStore();

  const [prize, setPrize] = useState('')
  const [description, setDescription] = useState('')
  const [imageLink, setImageLink] = useState('')
  const [cost, setCost] = useState(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    fetchRewards();
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Adding new reward")
  }

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
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Prize</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="text-right">Image URL</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell className="font-medium">{reward.prize}</TableCell>
                    <TableCell>{reward.description}</TableCell>
                    <TableCell>{reward.cost}</TableCell>
                    <TableCell className="text-right">{reward.imageUrl}</TableCell>
                    <TableCell className="text-right">
                      <Button className=" bg-blue-800 text-white hover:bg-blue-400 hover:text-gray-800">Edit Reward</Button>
                      <Button className=" bg-blue-800 text-white hover:bg-blue-400 hover:text-gray-800">Delete Reward</Button>
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
