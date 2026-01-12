import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const alerts = [
  { id: 1, type: "warning", message: "High disk usage detected on node-3", time: "5 min ago" },
  { id: 2, type: "success", message: "Daily backup completed successfully", time: "1 hour ago" },
  { id: 3, type: "error", message: "Failed payment processing for TechEd Corp", time: "2 hours ago" },
  { id: 4, type: "warning", message: "API latency > 500ms spike detected", time: "4 hours ago" },
];

export function AlertsPanel() {
  return (
    <Card className="mt-6 border-border/50 bg-muted/20">
      <CardHeader className="py-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-bold">Recent Alerts</CardTitle>
          <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold">2 New</span>
        </div>
        <Button variant="link" size="sm" className="h-auto p-0 text-primary">View All</Button>
      </CardHeader>
      <CardContent className="pt-0 pb-4 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50 hover:border-primary/20 transition-colors">
            {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />}
            {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />}
            {alert.type === 'error' && <XCircle className="h-5 w-5 text-rose-500 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight text-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
