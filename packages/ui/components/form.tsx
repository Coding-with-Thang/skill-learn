"use client";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, ControllerProps, FormProvider, useFormContext, useFormState } from "react-hook-form";

import { cn } from "@skill-learn/lib/utils"
import { Label } from "./label"

const Form = FormProvider

interface FormFieldContextValue {
  name: string;
}
const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <TFieldValues extends object>(props: ControllerProps<TFieldValues>) => {
  const { name, ...rest } = props;
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...rest} />
    </FormFieldContext.Provider>
  );
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext?.name ?? "" })
  const fieldState = getFieldState(fieldContext?.name ?? "", formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

interface FormItemContextValue {
  id: string;
}
const FormItemContext = React.createContext<FormItemContextValue>({ id: "" })

type FormItemProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };

function FormItem({
  className,
  ...props
}: FormItemProps) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

type FormLabelProps = Omit<React.ComponentPropsWithoutRef<typeof Label>, "className"> & { className?: string };

function FormLabel({
  className,
  ...props
}: FormLabelProps) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-brand-tealestructive", className)}
      htmlFor={formItemId}
      {...props} />
  );
}

function FormControl({
  ...props
}) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props} />
  );
}

type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & { className?: string };

function FormDescription({
  className,
  ...props
}: FormDescriptionProps) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement> & { className?: string };

function FormMessage({
  className,
  ...props
}: FormMessageProps) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-brand-tealestructive text-sm", className)}
      {...props}>
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
