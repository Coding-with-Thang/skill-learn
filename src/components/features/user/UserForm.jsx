"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsersStore } from "@/lib/store/usersStore";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { toast } from "sonner";

export default function UserForm({ user = null, onSuccess }) {
    const { createUser, updateUser, isLoading, users } = useUsersStore();
    const { role: currentUserRole } = useUserRole();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        username: user?.username || "",
        password: "",
        role: user?.role || "AGENT",
        manager: user?.manager || "",
    });
    const [error, setError] = useState("");

    // Fetch users if not already loaded
    useEffect(() => {
        if (users.length === 0) {
            useUsersStore.getState().fetchUsers();
        }
    }, [users.length]);

    // Get list of managers for the dropdown
    const managerOptions = useMemo(() => {
        const managers = users.filter(u => u.role === "MANAGER");
        return [
            { value: "none", label: "No Manager" },
            ...managers.map(m => ({
                value: m.username,
                label: `${m.firstName} ${m.lastName} (${m.username})`
            }))
        ];
    }, [users]);

    // Determine if current user can change roles
    const canChangeRole = currentUserRole === "OPERATIONS";
    
    // Determine if role field should be disabled
    const isRoleDisabled = !canChangeRole || (user && user.role === "AGENT" && currentUserRole === "MANAGER");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Prepare submit data - clear manager if role is not AGENT
        const submitData = { ...formData };
        if (submitData.role !== "AGENT") {
            submitData.manager = "";
        }

        try {
            if (user) {
                await updateUser(user.id, submitData);
                toast.success("User updated successfully!");
            } else {
                await createUser(submitData);
                toast.success("User created successfully!");
            }
            onSuccess?.();
        } catch (error) {
            setError(error.message || "An error occurred");
            toast.error(error.message || "An error occurred");
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            // Clear manager if role is changed to non-AGENT
            if (field === "role" && value !== "AGENT") {
                updated.manager = "";
            }
            return updated;
        });
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{user ? "Edit User" : "Create User"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleChange("firstName", e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleChange("lastName", e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            required={!user}
                        />
                    </div>

                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select 
                            value={formData.role} 
                            onValueChange={(value) => handleChange("role", value)}
                            disabled={isRoleDisabled}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AGENT">Agent</SelectItem>
                                {canChangeRole && (
                                    <>
                                        <SelectItem value="MANAGER">Manager</SelectItem>
                                        <SelectItem value="OPERATIONS">Operations</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        {isRoleDisabled && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {currentUserRole === "MANAGER" && user?.role === "AGENT"
                                    ? "Managers cannot change agent roles"
                                    : "Only Operations can change roles"}
                            </p>
                        )}
                    </div>

                    {/* Manager selection - only show for AGENT role */}
                    {formData.role === "AGENT" && (
                        <div>
                            <Label htmlFor="manager">Manager</Label>
                            <Select 
                                value={formData.manager || "none"} 
                                onValueChange={(value) => handleChange("manager", value === "none" ? "" : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    {managerOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {error && (
                        <div className="text-error text-sm">{error}</div>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Loading..." : user ? "Update User" : "Create User"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
