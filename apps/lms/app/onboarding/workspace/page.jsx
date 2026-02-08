"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Briefcase,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Globe,
  Shield,
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@skill-learn/ui/components/card";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { toast } from "sonner";
import { slugify } from "@skill-learn/lib/utils/utils.js";

const industries = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const teamSizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export default function OnboardingWorkspacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  
  const { isSignedIn, user, isLoaded } = useUser();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState([]);
  const [defaultRoleId, setDefaultRoleId] = useState("");
  const [rolesLoading, setRolesLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    industry: "",
    teamSize: "",
    subdomain: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/onboarding/account?session_id=${sessionId}`);
    }
  }, [isLoaded, isSignedIn, router, sessionId]);

  // Auto-generate subdomain from organization name
  useEffect(() => {
    if (formData.organizationName) {
      const subdomain = slugify(formData.organizationName).substring(0, 30);
      setFormData((prev) => ({ ...prev, subdomain }));
    }
  }, [formData.organizationName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.organizationName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/onboarding/create-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          organizationName: formData.organizationName,
          industry: formData.industry,
          teamSize: formData.teamSize,
          subdomain: formData.subdomain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create workspace");
      }

      toast.success("Workspace created successfully!");
      setStep(2);
      setRolesLoading(true);
      try {
        const rolesRes = await fetch("/api/tenant/roles");
        const rolesData = await rolesRes.json();
        if (rolesRes.ok && rolesData?.roles?.length) {
          setRoles(rolesData.roles);
          const guestOrFirst = rolesData.roles.find((r) => r.roleAlias === "Guest" || r.doesNotCountTowardSlotLimit) || rolesData.roles[0];
          setDefaultRoleId(guestOrFirst.id);
        }
      } catch (fetchErr) {
        console.error("Failed to load roles:", fetchErr);
        toast.error("Could not load roles. Using default.");
        router.push("/onboarding/complete");
        return;
      } finally {
        setRolesLoading(false);
      }
    } catch (err) {
      console.error("Workspace creation error:", err);
      toast.error(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultRoleSubmit = async (e) => {
    e.preventDefault();
    if (!defaultRoleId) {
      toast.error("Please select a default role");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultRoleId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to set default role");
      }
      toast.success("Default role set.");
      router.push("/onboarding/complete");
    } catch (err) {
      console.error("Default role update error:", err);
      toast.error(err.message || "Failed to set default role");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-teal mx-auto" />
            <p className="text-gray-600 mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            ✓
          </div>
          <span className="text-sm font-medium text-green-600">Payment</span>
        </div>
        <div className="w-8 h-px bg-green-500" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            ✓
          </div>
          <span className="text-sm font-medium text-green-600">Account</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > 1 ? "bg-green-500 text-white" : "bg-brand-teal text-white"}`}>
            {step > 1 ? "✓" : "3"}
          </div>
          <span className="text-sm font-medium text-brand-teal">Workspace</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-brand-teal text-white" : "bg-gray-200 text-gray-500"}`}>
            {step > 2 ? "✓" : "4"}
          </div>
          <span className={`text-sm font-medium ${step >= 2 ? "text-brand-teal" : "text-gray-500"}`}>Default role</span>
        </div>
      </div>

      {step === 1 && (
      <Card>
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Building2 className="w-8 h-8 text-brand-teal" />
          </motion.div>
          <CardTitle className="text-2xl">Set Up Your Workspace</CardTitle>
          <CardDescription>
            Create your organization&apos;s learning environment
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organizationName">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  placeholder="Acme Corporation"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Workspace URL</Label>
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="subdomain"
                    name="subdomain"
                    type="text"
                    placeholder="acme"
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    className="pl-10 rounded-r-none"
                    pattern="[a-z0-9-]+"
                  />
                </div>
                <div className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md text-sm text-gray-500">
                  .skill-learn.com
                </div>
              </div>
              <p className="text-xs text-gray-500">
                This will be your workspace&apos;s unique URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleSelectChange("industry", value)}
              >
                <SelectTrigger>
                  <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Select
                value={formData.teamSize}
                onValueChange={(value) => handleSelectChange("teamSize", value)}
              >
                <SelectTrigger>
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              Create Workspace
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      {step === 2 && (
      <Card>
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="w-8 h-8 text-brand-teal" />
          </motion.div>
          <CardTitle className="text-2xl">Default Role for New Users</CardTitle>
          <CardDescription>
            New users and anyone without a role will get this role by default. You can change this later in settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
          ) : (
            <form onSubmit={handleDefaultRoleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="defaultRoleId">Default role</Label>
                <Select
                  value={defaultRoleId}
                  onValueChange={setDefaultRoleId}
                >
                  <SelectTrigger>
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <SelectValue placeholder="Select default role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.roleAlias}
                        {role.doesNotCountTowardSlotLimit && " (view-only, doesn’t count toward role limit)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !defaultRoleId}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                Continue
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      )}

      {user && (
        <p className="text-sm text-center text-gray-500 mt-6">
          Signed in as {user.primaryEmailAddress?.emailAddress}
        </p>
      )}
    </div>
  );
}
