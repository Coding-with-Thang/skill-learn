import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ title, value, icon: Icon, trend, description }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {Icon && <Icon className="h-5 w-5 text-gray-500" />}
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <h3 className="text-2xl font-bold tracking-tight">
                {value}
                {trend && (
                  <span className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </span>
                )}
              </h3>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 