"use client"

import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-input"
import { FormSelect } from "@/components/ui/form-select"
import { FormDescription } from "@/components/ui/form"
import { useUsersStore } from "@/lib/store/usersStore"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { toast } from "sonner"
import { userCreateSchema, userUpdateSchema } from "@/lib/zodSchemas"

export default function UserForm({ user = null, onSuccess }) {
    const { createUser, updateUser, isLoading, users } = useUsersStore()
    const { role: currentUserRole } = useUserRole()

    // Fetch users if not already loaded
    useEffect(() => {
        if (users.length === 0) {
            useUsersStore.getState().fetchUsers()
        }
    }, [users.length])

    const schema = user ? userUpdateSchema : userCreateSchema
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            username: user?.username || "",
            password: "",
            role: user?.role || "AGENT",
            manager: user?.manager || "",
        },
    })

    const watchedRole = form.watch("role")
    const watchedManager = form.watch("manager")

    // Get list of managers for the dropdown
    // - AGENT role: can be assigned MANAGER or OPERATIONS
    // - MANAGER role: can only be assigned OPERATIONS
    const managerOptions = useMemo(() => {
        let managers
        if (watchedRole === "MANAGER") {
            // Managers can only be assigned OPERATIONS as their manager
            managers = users.filter((u) => u.role === "OPERATIONS")
        } else {
            // Agents can be assigned MANAGER or OPERATIONS
            managers = users.filter(
                (u) => u.role === "MANAGER" || u.role === "OPERATIONS"
            )
        }
        return [
            { value: "none", label: "No Manager" },
            ...managers.map((m) => ({
                value: m.username,
                label: `${m.firstName} ${m.lastName} (${m.username}) - ${m.role}`,
            })),
        ]
    }, [users, watchedRole])

    // Clear manager when role changes to non-AGENT/MANAGER
    useEffect(() => {
        if (watchedRole !== "AGENT" && watchedRole !== "MANAGER") {
            if (watchedManager) {
                form.setValue("manager", "")
            }
        }
    }, [watchedRole, watchedManager, form])

    // Determine if current user can change roles
    const canChangeRole = currentUserRole === "OPERATIONS"

    // Determine if role field should be disabled
    const isRoleDisabled =
        !canChangeRole ||
        (user && user.role === "AGENT" && currentUserRole === "MANAGER")

    const roleOptions = useMemo(() => {
        const options = [{ value: "AGENT", label: "Agent" }]
        if (canChangeRole) {
            options.push(
                { value: "MANAGER", label: "Manager" },
                { value: "OPERATIONS", label: "Operations" }
            )
        }
        return options
    }, [canChangeRole])

    const onSubmit = async (data) => {
        try {
            // Prepare submit data - clear manager if role is not AGENT or MANAGER
            const submitData = { ...data }
            if (submitData.manager === "none") {
                submitData.manager = ""
            }
            if (submitData.role !== "AGENT" && submitData.role !== "MANAGER") {
                submitData.manager = ""
            }
            // Remove password if empty (for updates)
            if (user && !submitData.password) {
                delete submitData.password
            }

            if (user) {
                await updateUser(user.id, submitData)
                toast.success("User updated successfully!")
            } else {
                await createUser(submitData)
                toast.success("User created successfully!")
            }
            onSuccess?.()
        } catch (error) {
            toast.error(error.message || "An error occurred")
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{user ? "Edit User" : "Create User"}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormInput
                            name="firstName"
                            label="First Name"
                            placeholder="Enter first name"
                        />

                        <FormInput
                            name="lastName"
                            label="Last Name"
                            placeholder="Enter last name"
                        />

                        <FormInput
                            name="username"
                            label="Username"
                            placeholder="Enter username"
                        />

                        <FormInput
                            name="password"
                            label="Password"
                            type="password"
                            placeholder={user ? "Leave blank to keep current password" : "Enter password"}
                        />

                        <FormSelect
                            name="role"
                            label="Role"
                            options={roleOptions}
                            disabled={isRoleDisabled}
                        />
                        {isRoleDisabled && (
                            <FormDescription>
                                {currentUserRole === "MANAGER" && user?.role === "AGENT"
                                    ? "Managers cannot change agent roles"
                                    : "Only Operations can change roles"}
                            </FormDescription>
                        )}

                        {/* Manager selection - show for AGENT and MANAGER roles */}
                        {(watchedRole === "AGENT" || watchedRole === "MANAGER") && (
                            <>
                                <FormSelect
                                    name="manager"
                                    label="Manager"
                                    placeholder="Select a manager"
                                    options={managerOptions}
                                />
                                {watchedRole === "MANAGER" && (
                                    <FormDescription>
                                        Managers can only be assigned an OPERATIONS user as their
                                        manager
                                    </FormDescription>
                                )}
                            </>
                        )}

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Loading..." : user ? "Update User" : "Create User"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
