"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Badge } from "@skill-learn/ui/components/badge";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@skill-learn/ui/components/dialog";
import {
  Key,
  UserPlus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Users,
  Shield,
  Pencil,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUserRolesStore } from "@skill-learn/lib/stores/userRolesStore";

export default function UserRolesPage() {
  // Use selectors to only re-render when specific state changes
  const userRoles = useUserRolesStore((state) => state.userRoles);
  const roles = useUserRolesStore((state) => state.roles);
  const users = useUserRolesStore((state) => state.users);
  const storeLoading = useUserRolesStore((state) => state.isLoading);
  const storeError = useUserRolesStore((state) => state.error);
  const fetchAll = useUserRolesStore((state) => state.fetchAll);
  const assignRole = useUserRolesStore((state) => state.assignRole);
  const removeRole = useUserRolesStore((state) => state.removeRole);

  // Local state (UI only)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state (assign or re-assign). When re-assigning, we need to remove the old assignment first.
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [reassignUserRoleId, setReassignUserRoleId] = useState(null);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchAll();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } }; message?: string };
        setError(e.response?.data?.error || e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchAll]);

  // Combine loading states
  const isLoading = loading || storeLoading;
  const displayError = error || storeError;

  // Handle assign role (or re-assign: remove existing then assign new)
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return;
    setFormLoading(true);
    setFormError(null);

    try {
      if (reassignUserRoleId) {
        await removeRole(reassignUserRoleId);
        setReassignUserRoleId(null);
      }
      await assignRole(selectedUserId, selectedRoleId);
      setAssignDialogOpen(false);
      setSelectedUserId("");
      setSelectedRoleId("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setFormError(e.response?.data?.error || e.message || "Failed to assign role");
    } finally {
      setFormLoading(false);
    }
  };

  // Open assign dialog for re-assign (pre-fill user and current role)
  const openReassignDialog = (userRole) => {
    setSelectedUserId(userRole.user?.clerkId || userRole.userId || "");
    setSelectedRoleId(userRole.role?.id || userRole.roleId || "");
    setReassignUserRoleId(userRole.id);
    setFormError(null);
    setAssignDialogOpen(true);
  };

  // Filter user roles
  const filteredUserRoles = userRoles.filter((ur) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      ur.user?.username?.toLowerCase().includes(search) ||
      ur.user?.fullName?.toLowerCase().includes(search) ||
      ur.user?.email?.toLowerCase().includes(search) ||
      ur.role?.roleAlias?.toLowerCase().includes(search)
    );
  });

  // Group by user
  const userRolesByUser = filteredUserRoles.reduce((acc, ur) => {
    const key = ur.userId;
    if (!acc[key]) {
      acc[key] = {
        userId: ur.userId,
        user: ur.user,
        roles: [],
      };
    }
    acc[key].roles.push(ur);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{displayError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Role Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Assign roles to users in your organization.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              setLoading(true);
              try {
                await fetchAll(true); // Force refresh
              } finally {
                setLoading(false);
              }
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setAssignDialogOpen(true)} disabled={roles.length === 0}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Assignments</p>
              <p className="text-2xl font-bold">{userRoles.length}</p>
            </div>
            <Key className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Users with Roles</p>
              <p className="text-2xl font-bold">{Object.keys(userRolesByUser).length}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Roles</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by user or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User Roles */}
      {roles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No roles configured yet. Create roles first before assigning them.
            </p>
            <Button variant="outline" onClick={() => (window.location.href = "/dashboard/roles")}>
              Go to Roles Management
            </Button>
          </CardContent>
        </Card>
      ) : userRoles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No role assignments yet.</p>
            <Button onClick={() => setAssignDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign First Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Role Assignments</CardTitle>
            <CardDescription>
              {filteredUserRoles.length} assignment(s) found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Assigned</th>
                  <th className="text-right p-4 font-medium">Re-assign</th>
                </tr>
              </thead>
              <tbody>
                {filteredUserRoles.map((ur, index) => (
                  <motion.tr
                    key={ur.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {ur.user?.imageUrl ? (
                          <img
                            src={ur.user.imageUrl}
                            alt={ur.user.username}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-semibold">
                            {ur.user?.firstName?.[0] || "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {ur.user?.fullName || ur.user?.username || ur.userId}
                          </p>
                          {ur.user?.email && (
                            <p className="text-xs text-muted-foreground">
                              {ur.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{ur.role?.roleAlias}</Badge>
                        {ur.role?.createdFromTemplate ? (
                          <Badge variant="secondary" className="text-xs">
                            Template
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(ur.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReassignDialog(ur)}
                        className="gap-1.5"
                      >
                        <Pencil className="h-4 w-4" />
                        Re-assign
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Assign / Re-assign Role Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign or Re-assign Role</DialogTitle>
            <DialogDescription>
              Every user must have a role. Select a user and role to assign or change their role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>User *</Label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.clerkId || u.id}>
                    {u.firstName} {u.lastName} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Role *</Label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a role...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roleAlias}
                    {r.createdFromTemplate ? ` (Template: ${r.createdFromTemplate.templateSetName})` : ' (Custom)'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                You can assign both custom roles and roles created from templates.
              </p>
            </div>
            {formError && (
              <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedUserId("");
                setSelectedRoleId("");
                setReassignUserRoleId(null);
                setFormError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedUserId || !selectedRoleId || formLoading}
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
