"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Badge } from "@skill-learn/ui/components/badge";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import { Checkbox } from "@skill-learn/ui/components/checkbox";
import { Progress } from "@skill-learn/ui/components/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@skill-learn/ui/components/dialog";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Key,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@skill-learn/lib/utils/axios";
import { useRolesStore } from "@skill-learn/lib/stores/rolesStore";

export default function RolesPage() {
  const t = useTranslations("adminRoles");
  // Use selectors to only re-render when specific state changes
  const roles = useRolesStore((state) => state.roles);
  const tenant = useRolesStore((state) => state.tenant);
  const usedSlots = useRolesStore((state) => state.usedSlots);
  const availableSlots = useRolesStore((state) => state.availableSlots);
  const permissions = useRolesStore((state) => state.permissions);
  const groupedPermissions = useRolesStore((state) => state.permissionsByCategory);
  const templates = useRolesStore((state) => state.templates);
  const storeLoading = useRolesStore((state) => state.isLoading);
  const storeError = useRolesStore((state) => state.error);
  const fetchRoles = useRolesStore((state) => state.fetchRoles);
  const fetchPermissions = useRolesStore((state) => state.fetchPermissions);
  const fetchTemplates = useRolesStore((state) => state.fetchTemplates);
  const createRole = useRolesStore((state) => state.createRole);
  const updateRole = useRolesStore((state) => state.updateRole);
  const deleteRole = useRolesStore((state) => state.deleteRole);

  // Get store instance for accessing updated state after mutations
  const rolesStore = useRolesStore.getState();

  // Local state (UI only)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  type RoleItem = { id: string; roleAlias?: string; permissions?: { id: string }[] };
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [roleForm, setRoleForm] = useState({
    roleAlias: "",
    description: "",
    slotPosition: 1,
    templateId: "",
  });
  const [selectedTemplateSet, setSelectedTemplateSet] = useState("generic");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Expanded categories in permissions dialog
  const [expandedCategories, setExpandedCategories] = useState({});

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rolesData, permissionsData, templatesData] = await Promise.all([
          fetchRoles(),
          fetchPermissions(),
          fetchTemplates(),
        ]);

        // Set expanded categories from permissions data
        if (permissionsData?.categories) {
          const expanded = {};
          permissionsData.categories.forEach((cat) => (expanded[cat] = true));
          setExpandedCategories(expanded);
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } }; message?: string };
        setError(e.response?.data?.error || e.message || t("errorLoadData"));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchRoles, fetchPermissions, fetchTemplates]);

  // Combine store loading with local loading
  const isLoading = loading || storeLoading;
  const displayError = error || storeError;

  // Handle create/update role
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (isEditing && selectedRole) {
        await updateRole(selectedRole.id, roleForm);
      } else {
        await createRole(roleForm);
      }

      setRoleDialogOpen(false);
      resetRoleForm();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e.message ?? t("errorGeneric"));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await deleteRole(selectedRole.id);

      setDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e.message ?? t("errorGeneric"));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle initialize roles
  const handleInitializeRoles = async () => {
    setFormLoading(true);
    setFormError(null);

    try {
      const response = await api.put("/tenant/roles", { templateSetName: selectedTemplateSet });

      if (response.data.error) throw new Error(response.data.error || t("errorInitRoles"));

      // Refresh roles from store
      await fetchRoles(true); // Force refresh

      setInitDialogOpen(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e.message ?? t("errorGeneric"));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = async (permissionId: string, isChecked: boolean) => {
    if (!selectedRole) return;

    try {
      const response = await api.put(`/tenant/roles/${selectedRole.id}`, {
        permissionIds: isChecked
          ? [...(selectedRole.permissions ?? []).map((p) => p.id), permissionId]
          : (selectedRole.permissions ?? []).filter((p) => p.id !== permissionId).map((p) => p.id),
      });

      if (response.data.error) {
        throw new Error(response.data.error || t("errorUpdatePermissions"));
      }

      // Refresh roles and update selected from store
      await fetchRoles(true); // Force refresh
      // Get fresh state after refresh
      const updatedRoles = useRolesStore.getState().roles;
      const updated = updatedRoles.find((r) => r.id === selectedRole.id);
      if (updated) setSelectedRole(updated);
    } catch {
      // ignore
    }
  };

  // Reset form
  const resetRoleForm = () => {
    setRoleForm({
      roleAlias: "",
      description: "",
      slotPosition: roles.length + 1,
      templateId: "",
    });
    setSelectedRole(null);
    setIsEditing(false);
    setFormError(null);
  };

  // Open edit dialog
  const openEditRole = (role) => {
    setSelectedRole(role);
    setRoleForm({
      roleAlias: role.roleAlias,
      description: role.description || "",
      slotPosition: role.slotPosition,
      templateId: "",
    });
    setIsEditing(true);
    setRoleDialogOpen(true);
  };

  // Category display name
  const getCategoryDisplayName = (category) =>
    category
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (displayError) {
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
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setLoading(true);
              Promise.all([fetchRoles(true), fetchPermissions(true), fetchTemplates(true)]).finally(() => setLoading(false));
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {roles.length === 0 && (
            <Button variant="outline" onClick={() => setInitDialogOpen(true)}>
              {t("initFromTemplate")}
            </Button>
          )}
          <Button
            onClick={() => {
              resetRoleForm();
              setRoleDialogOpen(true);
            }}
            disabled={availableSlots <= 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addRole")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("roleSlotsUsed")}</p>
              <p className="text-2xl font-bold">
                {usedSlots} / {tenant?.maxRoleSlots || 5}
              </p>
            </div>
            <Progress
              value={tenant?.maxRoleSlots ? (usedSlots / tenant.maxRoleSlots) * 100 : 0}
              className="w-1/2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      {roles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{t("noRolesYet")}</p>
            <Button onClick={() => setInitDialogOpen(true)}>
              {t("initFromTemplateSet")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {t("slot")} {role.slotPosition}
                        </Badge>
                        {role.createdFromTemplate ? (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            {t("template")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {t("custom")}
                          </Badge>
                        )}
                        {!role.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            {t("inactive")}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{role.roleAlias}</CardTitle>
                      {role.description && (
                        <CardDescription className="mt-1">
                          {role.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Key className="h-4 w-4" />
                        {t("permissions")}
                      </span>
                      <span className="font-medium">{role.permissionCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {t("users")}
                      </span>
                      <span className="font-medium">{role.userCount}</span>
                    </div>

                    {role.createdFromTemplate && (
                      <p className="text-xs text-muted-foreground">
                        {t("basedOn")}: {role.createdFromTemplate.roleName}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedRole(role);
                          setPermissionsDialogOpen(true);
                        }}
                      >
                        <Key className="h-4 w-4 mr-1" />
                        {t("permissions")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedRole(role);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={role.userCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? t("editRole") : t("createRole")}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? t("editRoleDescription")
                : t("createRoleDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t("roleName")} *</Label>
                <Input
                  value={roleForm.roleAlias}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, roleAlias: e.target.value })
                  }
                  placeholder={t("roleNamePlaceholder")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("descriptionLabel")}</Label>
                <Input
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, description: e.target.value })
                  }
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>
              {!isEditing && (
                <div className="grid gap-2">
                  <Label>{t("baseOnTemplate")}</Label>
                  <select
                    value={roleForm.templateId}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, templateId: e.target.value })
                    }
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">{t("customRoleNoTemplate")}</option>
                    {templates.map((set) =>
                      set.roles.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {set.name} / {tmpl.roleName} ({tmpl.permissionCount} {t("permissionsCount")})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
              {formError && (
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                  {formError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoleDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEditing ? t("updateRole") : t("createRole")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("managePermissions")} - {selectedRole?.roleAlias}</DialogTitle>
            <DialogDescription>
              {t("selectPermissionsDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {Object.keys(groupedPermissions).map((category) => {
              const categoryPerms = groupedPermissions[category] || [];
              if (categoryPerms.length === 0) return null;

              const selectedPermIds = new Set(
                selectedRole?.permissions?.map((p) => p.id) || []
              );
              const selectedCount = categoryPerms.filter((p) =>
                selectedPermIds.has(p.id)
              ).length;

              return (
                <div key={category} className="mb-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 w-full text-left font-medium mb-2 hover:text-primary"
                    onClick={() =>
                      setExpandedCategories((prev) => ({
                        ...prev,
                        [category]: !prev[category],
                      }))
                    }
                  >
                    {expandedCategories[category] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {getCategoryDisplayName(category)}
                    <Badge variant="secondary" className="text-xs ml-2">
                      {selectedCount}/{categoryPerms.length}
                    </Badge>
                  </button>
                  <AnimatePresence>
                    {expandedCategories[category] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-2 gap-2 ml-6"
                      >
                        {categoryPerms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedPermIds.has(perm.id)}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(perm.id, checked)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {perm.displayName}
                              </p>
                              <code className="text-xs text-muted-foreground">
                                {perm.name}
                              </code>
                            </div>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPermissionsDialogOpen(false)}
            >
              {t("done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteRole")}</DialogTitle>
            <DialogDescription>
              {t("deleteRoleConfirm", { roleName: selectedRole?.roleAlias ?? "" })}
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
              {formError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={formLoading}
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("deleteRole")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Dialog */}
      <Dialog open={initDialogOpen} onOpenChange={setInitDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("initRolesTitle")}</DialogTitle>
            <DialogDescription>
              {t("initRolesDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label>{t("templateSet")}</Label>
              <select
                value={selectedTemplateSet}
                onChange={(e) => setSelectedTemplateSet(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {templates.map((set) => (
                  <option key={set.key} value={set.key}>
                    {set.name} - {set.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">{t("rolesToBeCreated")}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {templates
                  .find((s) => s.key === selectedTemplateSet)
                  ?.roles.map((tmplRole) => (
                    <li key={tmplRole.id}>
                      {tmplRole.slotPosition}. {tmplRole.roleName} - {tmplRole.description}
                    </li>
                  ))}
              </ul>
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
              onClick={() => setInitDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleInitializeRoles} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("initializeRoles")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
