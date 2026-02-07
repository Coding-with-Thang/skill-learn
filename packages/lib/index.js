// Export utilities
export { cn } from "./utils.js";
export * from "./zodSchemas.js";

// Export commonly used utils
export * from "./utils/axios.js";
export * from "./utils/utils.js";
export * from "./utils/errorHandler.js";
export * from "./utils/apiWrapper.js";
export * from "./utils/permissions.js";
export * from "./utils/clerkSync.js";

// Export hooks (re-export from hooks directory)
export { useAppTheme } from "./hooks/useAppTheme.js";
export { useDebounce } from "./hooks/useDebounce.js";
export { useLocalStorage } from "./hooks/useLocalStorage.js";
export { useIsMobile as useMobile } from "./hooks/useMobile.js";
export { useIsMobile } from "./hooks/useMobile.js";
export { usePageTracking } from "./hooks/usePageTracking.js";
export { useUserRole } from "./hooks/useUserRole.js";
export { usePermissions, PERMISSIONS } from "./hooks/usePermissions.js";
export { useFeatures, FEATURE_KEYS } from "./hooks/useFeatures.js";
export { useAuditLog } from "./hooks/useAuditLog.js";
export { useWelcomeContext } from "./hooks/useWelcomeContext.js";

// Export stores (re-export from stores directory)
export * from "./stores/store/auditLogStore.js";
export * from "./stores/store/categoryStore.js";
export * from "./stores/store/coursesStore.js";
export * from "./stores/store/pointsStore.js";
export * from "./stores/store/progressStore.js";
export * from "./stores/store/quizStore.js";
export * from "./stores/store/rewardStore.js";
export * from "./stores/store/usersStore.js";
export * from "./stores/store/flashCardStudyStore.js";
export * from "./stores/store/flashCardDeckBuilderStore.js";
