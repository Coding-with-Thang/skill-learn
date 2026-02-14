// Export utilities
export { cn, extractTextFromProseMirror } from './utils';
export * from './zodSchemas';

// Export commonly used utils (exclude server-only: auth, permissions, clerkSync, tenant - use @skill-learn/lib/utils/*.js in API routes)
export * from './utils/axios';
export * from './utils/utils';
export * from './utils/errorHandler';
export * from './utils/apiWrapper';

// Export hooks (re-export from hooks directory)
export { useAppTheme } from './hooks/useAppTheme';
export { useDebounce } from './hooks/useDebounce';
export { useLocalStorage } from './hooks/useLocalStorage';
export { useIsMobile as useMobile } from './hooks/useMobile';
export { useIsMobile } from './hooks/useMobile';
export { usePageTracking } from './hooks/usePageTracking';
export { useUserRole } from './hooks/useUserRole';
export { usePermissions, PERMISSIONS } from './hooks/usePermissions';
export { useFeatures, FEATURE_KEYS } from './hooks/useFeatures';
export { useSubscription } from './hooks/useSubscription';
export { useAuditLog } from './hooks/useAuditLog';
export { useWelcomeContext } from './hooks/useWelcomeContext';

// Export stores (re-export from stores directory)
export * from './stores/store/auditLogStore';
export * from './stores/store/categoryStore';
export * from './stores/store/coursesStore';
export * from './stores/store/pointsStore';
export * from './stores/store/progressStore';
export * from './stores/store/quizStore';
export * from './stores/store/rewardStore';
export * from './stores/store/usersStore';
export * from './stores/store/flashCardStudyStore';
export * from './stores/store/flashCardDeckBuilderStore';
