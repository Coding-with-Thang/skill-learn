"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const tenants = [
  { id: 1, name: "Acme University", plan: "Enterprise", users: 1247, status: "Active", lastActive: "2 hours ago", img: "/avatars/01.png" },
  { id: 2, name: "TechEd Corp", plan: "Professional", users: 850, status: "Active", lastActive: "5 mins ago", img: "/avatars/02.png" },
  { id: 3, name: "Digital Learning Inst.", plan: "Starter", users: 120, status: "Trial", lastActive: "1 day ago", img: "/avatars/03.png" },
  { id: 4, name: "Global Training Co", plan: "Enterprise", users: 3400, status: "Active", lastActive: "Just now", img: "/avatars/04.png" },
  { id: 5, name: "SmallBiz Academy", plan: "Starter", users: 45, status: "Suspended", lastActive: "2 weeks ago", img: "/avatars/05.png" },
  { id: 6, name: "Code Masters", plan: "Professional", users: 670, status: "Active", lastActive: "3 hours ago", img: "/avatars/06.png" },
  { id: 7, name: "HealthTrain", plan: "Enterprise", users: 2100, status: "Active", lastActive: "1 hour ago", img: "/avatars/07.png" },
  { id: 8, name: "Design School", plan: "Professional", users: 430, status: "Trial", lastActive: "4 hours ago", img: "/avatars/08.png" },
  { id: 9, name: "FinTech Learn", plan: "Professional", users: 560, status: "Active", lastActive: "10 mins ago", img: "/avatars/09.png" },
  { id: 10, name: "Retail Edu", plan: "Starter", users: 89, status: "Active", lastActive: "2 days ago", img: "/avatars/10.png" },
];

export function TenantTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "Trial": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Suspended": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case "Enterprise": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50";
      case "Professional": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200/50";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200/50";
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Recent Tenant Activity</h3>
          <p className="text-sm text-muted-foreground">Manage and monitor all tenant organizations.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              className="pl-9 w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Tenant Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${tenant.name}`} />
                      <AvatarFallback>{tenant.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span>{tenant.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPlanBadge(tenant.plan)}>
                    {tenant.plan}
                  </Badge>
                </TableCell>
                <TableCell>{tenant.users.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(tenant.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'Active' ? 'bg-emerald-500' :
                        tenant.status === 'Trial' ? 'bg-blue-500' : 'bg-rose-500'
                      }`} />
                    {tenant.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{tenant.lastActive}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose-600">Suspend Tenant</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Showing 1-10 of 234</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="outline" size="sm">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
