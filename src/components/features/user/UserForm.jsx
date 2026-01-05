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

    // Validate and update manager when role changes
    useEffect(() => {
        if (formData.role === "AGENT" || formData.role === "MANAGER") {
            // Only validate if manager is set
            if (formData.manager) {
                const currentManager = users.find(u => u.username === formData.manager);
                const isValidManager = managerOptions.some(opt => opt.value === formData.manager);
                
                // If current manager is not in the valid options, clear it
                if (!isValidManager && currentManager) {
                    setFormData(prev => ({ ...prev, manager: "" }));
                }
            }
        }
    }, [formData.role, managerOptions, users, formData.manager]);

    // Get list of managers for the dropdown
    // - AGENT role: can be assigned MANAGER or OPERATIONS
    // - MANAGER role: can only be assigned OPERATIONS
    const managerOptions = useMemo(() => {
        let managers;
        if (formData.role === "MANAGER") {
            // Managers can only be assigned OPERATIONS as their manager
            managers = users.filter(u => u.role === "OPERATIONS");
        } else {
            // Agents can be assigned MANAGER or OPERATIONS
            managers = users.filter(u => u.role === "MANAGER" || u.role === "OPERATIONS");
        }
        return [
            { value: "none", label: "No Manager" },
            ...managers.map(m => ({
                value: m.username,
                label: `${m.firstName} ${m.lastName} (${m.username}) - ${m.role}`
            }))
        ];
    }, [users, formData.role]);

    // Determine if current user can change roles
    const canChangeRole = currentUserRole === "OPERATIONS";
    
    // Determine if role field should be disabled
    const isRoleDisabled = !canChangeRole || (user && user.role === "AGENT" && currentUserRole === "MANAGER");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Prepare submit data - clear manager if role is not AGENT or MANAGER
        const submitData = { ...formData };
        if (submitData.role !== "AGENT" && submitData.role !== "MANAGER") {
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
            
            // Handle role changes
            if (field === "role") {
                // Clear manager if role is changed to non-AGENT and non-MANAGER
                if (value !== "AGENT" && value !== "MANAGER") {
                    updated.manager = "";
                } else if (value === "MANAGER" && prev.manager) {
                    // If changing to MANAGER role, validate current manager
                    // MANAGER role can only have OPERATIONS as manager
                    const currentManager = users.find(u => u.username === prev.manager);
                    if (currentManager && currentManager.role !== "OPERATIONS") {
                        // Current manager is not valid for MANAGER role, clear it
                        updated.manager = "";
                    }
                }
                // If changing to AGENT, no need to clear - both MANAGER and OPERATIONS are valid
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

                    {/* Manager selection - show for AGENT and MANAGER roles */}
                    {(formData.role === "AGENT" || formData.role === "MANAGER") && (
                        <div>
                            <Label htmlFor="manager">Manager</Label>
                            <Select 
                                key={`manager-select-${formData.role}`}
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
                            {formData.role === "MANAGER" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Managers can only be assigned an OPERATIONS user as their manager
                                </p>
                            )}
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
