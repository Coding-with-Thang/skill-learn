"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
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
    const t = useTranslations("adminDashboardUsers")
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
            firstName: user?.firstName != null ? String(user.firstName) : "",
            lastName: user?.lastName != null ? String(user.lastName) : "",
            username: user?.username != null ? String(user.username) : "",
            password: "",
            confirmPassword: "",
            tenantRoleId: (user?.tenantRoleId != null ? String(user.tenantRoleId) : defaultRoleId) ?? "",
            reportsToUserId: user?.reportsToUserId != null ? String(user.reportsToUserId) : "",
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
        const options = [{ value: "", label: t("reportsToNone") }]
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
                toast.success(t("userUpdated"))
            } else {
                await createUser(submitData)
                toast.success(t("userCreated"))
            }
            onSuccess?.()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errorGeneric"))
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{user ? t("editUser") : t("createUser")}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormInput
                            name="firstName"
                            label={t("firstName")}
                            placeholder={t("firstNamePlaceholder")}
                        />

                        <FormInput
                            name="lastName"
                            label={t("lastName")}
                            placeholder={t("lastNamePlaceholder")}
                        />

                        <FormInput
                            name="username"
                            label={t("username")}
                            placeholder={t("usernamePlaceholder")}
                        />

                        <FormInput
                            name="password"
                            label={t("password")}
                            type="password"
                            placeholder={user ? t("passwordPlaceholderEdit") : t("passwordPlaceholder")}
                            autoComplete="new-password"
                        />
                        <FormInput
                            name="confirmPassword"
                            label={t("confirmPasswordLabel")}
                            type="password"
                            placeholder={user ? t("confirmPasswordPlaceholderEdit") : t("confirmPasswordPlaceholder")}
                            autoComplete="new-password"
                        />

                        {roleOptions.length > 0 ? (
                            <>
                                <FormSelect
                                    name="tenantRoleId"
                                    label={t("role")}
                                    options={roleOptions}
                                    disabled={isRoleDisabled}
                                />
                                {isRoleDisabled && (
                                    <FormDescription>
                                        {t("noPermissionChangeRoles")}
                                    </FormDescription>
                                )}
                                {!user && defaultRoleId && watchedTenantRoleId === defaultRoleId && (
                                    <FormDescription>
                                        {t("defaultRoleHint")}
                                    </FormDescription>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground p-3 border rounded">
                                {t("noRolesAvailable")}
                            </div>
                        )}

                        <FormSelect
                            name="reportsToUserId"
                            label={t("reportsToLabel")}
                            options={reportsToOptions}
                        />

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? t("loadingSubmit") : user ? t("updateUser") : t("createUser")}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
