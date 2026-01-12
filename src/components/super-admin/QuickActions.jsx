import { Plus, Download, CreditCard, Settings, Mail, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "Add Tenant", icon: Plus, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Generate Report", icon: Download, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Process Refund", icon: CreditCard, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "System Settings", icon: Settings, color: "text-gray-500", bg: "bg-gray-500/10" },
  { label: "Announcement", icon: Mail, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Invite Admin", icon: UserPlus, color: "text-pink-500", bg: "bg-pink-500/10" },
];

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-all group"
            >
              <div className={`p-2 rounded-full ${action.bg} group-hover:scale-110 transition-transform`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
