"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@skill-learn/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card"
import { Form, FormDescription } from "@skill-learn/ui/components/form"
import { FormInput } from "@skill-learn/ui/components/form-input"
import { FormSelect } from "@skill-learn/ui/components/form-select"
import { useUsersStore } from "@skill-learn/lib/stores/usersStore"
import { useRolesStore } from "@skill-learn/lib/stores/rolesStore"
import { usePermissionsStore } from "@skill-learn/lib/stores/permissionsStore"
import { toast } from "sonner"
import { userCreateSchema, userUpdateSchema } from "@/lib/zodSchemas"
import api from "@skill-learn/lib/utils/axios"

type UserFormProps = { user?: Record<string, unknown> | null; onSuccess?: () => void | Promise<void> };
export default function UserForm({ user = null, onSuccess }: UserFormProps) {
    const { createUser, updateUser, isLoading, users } = useUsersStore()
    const { roles, tenant, fetchRoles } = useRolesStore()
    const hasPermission = usePermissionsStore((s) => s.hasPermission)
    const fetchPermissions = usePermissionsStore((s) => s.fetchPermissions)
    const [defaultRoleId, setDefaultRoleId] = useState(null)

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    useEffect(() => {
        if (users.length === 0) {
            useUsersStore.getState().fetchUsers()
        }
    }, [users.length])

    // Fetch roles and tenant info on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch roles
                await fetchRoles()
                
                // Fetch tenant info to get defaultRoleId
                const tenantResponse = await api.get('/tenant')
                const tenantData = tenantResponse.data?.tenant
                if (tenantData?.defaultRoleId) {
                    setDefaultRoleId(tenantData.defaultRoleId)
                }
            } catch (error) {
                console.error('Error loading roles/tenant:', error)
            }
        }
        loadData()
    }, [fetchRoles])

    const schema = user ? userUpdateSchema : userCreateSchema
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            username: user?.username || "",
            password: "",
            confirmPassword: "",
            tenantRoleId: user?.tenantRoleId || defaultRoleId || "",
            reportsToUserId: user?.reportsToUserId ?? "",
        },
    })

    // Update form when defaultRoleId loads
    useEffect(() => {
        if (defaultRoleId && !user && !form.getValues('tenantRoleId')) {
            form.setValue('tenantRoleId', defaultRoleId)
        }
    }, [defaultRoleId, user, form])

    const watchedTenantRoleId = form.watch("tenantRoleId")

    // Check if current user can change roles - requires roles.assign permission
    const canChangeRole = hasPermission('roles.assign')
    const isRoleDisabled = !canChangeRole

    // Get tenant roles for the dropdown (active roles only)
    const roleOptions = useMemo(() => {
        const activeRoles = (roles || []).filter((r) => r.isActive)
        return activeRoles.map((role) => ({
            value: role.id,
            label: role.roleAlias,
        }))
    }, [roles])

    // Reports-to: same-tenant users, exclude self when editing
    const reportsToOptions = useMemo(() => {
        const list = (users || []).filter((u) => !user || u.id !== user.id)
        const options = [{ value: "", label: "None" }]
        list.forEach((u) => {
            options.push({
                value: u.id,
                label: `${u.firstName} ${u.lastName} (${u.username})`,
            })
        })
        return options
    }, [users, user])

    const onSubmit = async (data) => {
        try {
            const submitData = { ...data }
            if (!user && !submitData.tenantRoleId && defaultRoleId) {
                submitData.tenantRoleId = defaultRoleId
            }
            if (user && !submitData.password) {
                delete submitData.password
            }
            delete submitData.confirmPassword
            if (submitData.reportsToUserId === "") {
                submitData.reportsToUserId = null
            }

            if (user) {
                await updateUser(user.id, submitData)
                toast.success("User updated successfully!")
            } else {
                await createUser(submitData)
                toast.success("User created successfully!")
            }
            onSuccess?.()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred")
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
                            autoComplete="new-password"
                        />
                        <FormInput
                            name="confirmPassword"
                            label="Confirm password"
                            type="password"
                            placeholder={user ? "Re-enter new password (if changing)" : "Re-enter password"}
                            autoComplete="new-password"
                        />

                        {roleOptions.length > 0 ? (
                            <>
                                <FormSelect
                                    name="tenantRoleId"
                                    label="Role"
                                    options={roleOptions}
                                    disabled={isRoleDisabled}
                                />
                                {isRoleDisabled && (
                                    <FormDescription>
                                        You do not have permission to change user roles
                                    </FormDescription>
                                )}
                                {!user && defaultRoleId && watchedTenantRoleId === defaultRoleId && (
                                    <FormDescription>
                                        Default role for new users (can be changed in tenant settings)
                                    </FormDescription>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground p-3 border rounded">
                                No roles available. Please configure roles for this tenant first.
                            </div>
                        )}

                        <FormSelect
                            name="reportsToUserId"
                            label="Reports to"
                            options={reportsToOptions}
                        />

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Loading..." : user ? "Update User" : "Create User"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
