"use client"

import { useFormContext } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "./form"

export type FormSelectOption = string | { value: string; label: string };

interface FormSelectProps {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  options?: FormSelectOption[];
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  name,
  label,
  description,
  placeholder,
  options = [],
  disabled,
  className,
  ...props
}: FormSelectProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
            {...(disabled !== undefined && { disabled })}
            {...props}
          >
            <FormControl>
              <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => {
                const value = typeof option === "string" ? option : option.value
                const label = typeof option === "string" ? option : option.label
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

