// Export utilities
export { cn } from "./utils.js";
export * from "./zodSchemas.js";

// Export commonly used utils
export * from "./utils/utils/axios.js";
export * from "./utils/utils/errorHandler.js";
export * from "./utils/utils/apiWrapper.js";
export * from "./utils/utils/permissions.js";
export * from "./utils/utils/clerkSync.js";

// Export hooks (re-export from hooks directory)
export { useAppTheme } from "./hooks/hooks/useAppTheme.js";
export { useDebounce } from "./hooks/hooks/useDebounce.js";
export { useLocalStorage } from "./hooks/hooks/useLocalStorage.js";
export { useIsMobile as useMobile } from "./hooks/hooks/useMobile.js";
export { useIsMobile } from "./hooks/hooks/useMobile.js";
export { usePageTracking } from "./hooks/hooks/usePageTracking.js";
export { useUserRole } from "./hooks/hooks/useUserRole.js";
export { usePermissions, PERMISSIONS } from "./hooks/hooks/usePermissions.js";

// Export stores (re-export from stores directory)
export * from "./stores/store/auditLogStore.js";
export * from "./stores/store/categoryStore.js";
export * from "./stores/store/coursesStore.js";
export * from "./stores/store/pointsStore.js";
export * from "./stores/store/progressStore.js";
export * from "./stores/store/quizStore.js";
export * from "./stores/store/rewardStore.js";
export * from "./stores/store/usersStore.js";
