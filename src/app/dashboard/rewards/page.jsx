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
import { Star, StarOff, ExternalLink } from "lucide-react";
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
  const [claimUrl, setClaimUrl] = useState('')

  // Add a state to track which reward is being edited
  const [editingReward, setEditingReward] = useState(null)

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

  // Update the form state when a reward is selected for editing
  const handleEdit = (reward) => {
    setEditingReward(reward)
    setPrize(reward.prize)
    setDescription(reward.description)
    setImageLink(reward.imageUrl)
    setCost(reward.cost)
    setEnabled(reward.enabled)
    setClaimUrl(reward.claimUrl || '')
    setShowForm(true)
  }

  // Clear form when closing
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingReward(null)
    setPrize('')
    setDescription('')
    setImageLink('')
    setCost(null)
    setEnabled(true)
    setClaimUrl('')
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
                  onClick={handleCloseForm}
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
                    placeholder={editingReward ? editingReward.prize : "Enter prize name"}
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
                    placeholder={editingReward ? editingReward.description : "Enter description"}
                  />
                </div>
                <div>
                  <Label htmlFor="cost" className="block text-sm font-medium text-gray-600">Points Required</Label>
                  <Input
                    id="cost"
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder={editingReward ? editingReward.cost.toString() : "10000"}
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
                    placeholder={editingReward ? editingReward.imageUrl : "Enter image URL"}
                  />
                </div>
                <div>
                  <Label htmlFor="claimUrl" className="block text-sm font-medium text-gray-600">
                    Claim URL
                    <span className="ml-1 text-gray-400 text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="claimUrl"
                    type="url"
                    value={claimUrl}
                    onChange={(e) => setClaimUrl(e.target.value)}
                    className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder={editingReward ? editingReward.claimUrl : "https://example.com/claim"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Add a URL that users will be directed to after claiming this reward
                  </p>
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
                  <TableHead>Claim URL</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="text-center">Multiple</TableHead>
                  <TableHead className="text-center">Max Redemptions</TableHead>
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
                    <TableCell className="max-w-[200px] truncate">
                      {reward.claimUrl ? (
                        <a
                          href={reward.claimUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          {reward.claimUrl}
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </TableCell>
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
                    <TableCell className="text-center">
                      <Switch
                        checked={reward.allowMultiple}
                        onCheckedChange={async (checked) => {
                          await updateReward(reward.id, {
                            allowMultiple: checked,
                            maxRedemptions: checked ? null : 1
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="1"
                        className="w-20 mx-auto text-center"
                        value={reward.maxRedemptions || ''}
                        placeholder="-"
                        disabled={!reward.allowMultiple}
                        onChange={async (e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          await updateReward(reward.id, { maxRedemptions: value });
                        }}
                      />
                    </TableCell>
                    <TableCell className="flex gap-2 justify-center">
                      <Dialog>
                        <DialogTrigger>
                          <Button
                            className="bg-blue-800 text-white hover:bg-blue-400 hover:text-gray-800"
                            onClick={() => handleEdit(reward)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <AddRewards reward={editingReward} />
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
