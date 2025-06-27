import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ title, value, icon: Icon, trend, description }) {
  return (
    <Card className="bg-[var(--accent)]/90 dark:bg-[var(--accent)]/90">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {Icon && <Icon className="h-5 w-5 text-[var(--accent-foreground)] dark:text-[var(--accent-foreground)]" />}
            <div>
              <p className="text-sm font-medium text-[var(--muted-foreground)] dark:text-[--muted-foreground)]">{title}</p>
              <h3 className="text-2xl font-bold tracking-tight">
                {value}
                {trend && (
                  <span className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </span>
                )}
              </h3>
              {description && (
                <p className="text-xs text-[var(--muted-foreground)] dark:text-[--muted-foreground)">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 