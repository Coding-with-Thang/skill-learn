"use client";

import { formatDistanceToNow } from "date-fns";

export function ActivityLog({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 border border-[var(--muted-foreground)] rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm font-medium">
                <span className="font-semibold">{item.user}</span>{" "}
                <span className="text-[var(--muted-foreground)]">({item.role})</span>
              </p>
              <p className="text-sm text-[var(--primary)]">{item.action}</p>
            </div>
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
} 