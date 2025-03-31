import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import InputField from "../../InputField"

export default function AddRewards() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Reward</DialogTitle>
        <DialogDescription>
          Use this form to add reward.
        </DialogDescription>
        <InputField props={[1, 2, 3, 4]} />
      </DialogHeader>
    </DialogContent>
  )
}