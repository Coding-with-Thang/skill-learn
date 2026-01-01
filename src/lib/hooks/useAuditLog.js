import { useUser } from "@clerk/nextjs";
// Do not import server-only code here; keep this hook client-safe
import api from "@/utils/axios";

export function useAuditLog() {
  const { user } = useUser();

  const logUserAction = async (action, resource, resourceId, details) => {
    if (!user) return;

    try {
      await api.post("/admin/audit-logs", {
        action,
        resource,
        resourceId,
        details,
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
    }
  };

  return { logUserAction };
}
