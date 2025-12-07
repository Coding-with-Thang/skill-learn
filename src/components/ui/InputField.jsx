import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InputField({ props }) {
  const InputField = ({ label, labelName, onChange, value }) => {
    const handleChange = (e) => {
      const value = e.target.value
      onChange(value)
    }
  }
  return (
    <div className="flex flex-col">
      <Label className="text-xs" htmlFor={labelName}>
        {label}
      </Label>
      <Input onChange={handleChange} value={value} />
    </div>
  )
} 