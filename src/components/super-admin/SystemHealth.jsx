"use client";

import { CheckCircle2, AlertTriangle, Database, Server, HardDrive, Mail, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const StatusItem = ({ label, status, uptime, icon: Icon }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${status === 'operational' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className={`text-xs ${status === 'operational' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {status === 'operational' ? 'Operational' : 'Warning'}
          {uptime && <span className="text-muted-foreground ml-1">| {uptime}</span>}
        </p>
      </div>
    </div>
    <div className={`h-2.5 w-2.5 rounded-full ${status === 'operational' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
  </div>
);

const ResourceBar = ({ label, percentage, colorClass }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs mb-1">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-bold">{percentage}%</span>
    </div>
    <Progress value={percentage} className="h-2" indicatorClassName={colorClass} />
  </div>
);

export function SystemHealth() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ActivityIcon className="text-primary" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <StatusItem label="API Server" status="operational" uptime="99.98%" icon={Server} />
          <StatusItem label="Database" status="operational" uptime="2ms latency" icon={Database} />
          <StatusItem label="Storage" status="warning" uptime="78% used" icon={HardDrive} />
          <StatusItem label="Email Service" status="operational" icon={Mail} />
          <StatusItem label="Payment Gateway" status="operational" icon={CreditCard} />
        </div>

        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resource Usage</h4>
          <ResourceBar label="CPU Usage" percentage={45} colorClass="bg-indigo-500" />
          <ResourceBar label="Memory Usage" percentage={62} colorClass="bg-purple-500" />
          <ResourceBar label="Disk Space" percentage={78} colorClass="bg-amber-500" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
