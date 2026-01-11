# src/ Directory and Import Issues Summary

## 1. src/ Directory Status

### References Found:
- ✅ **components.json**: Has `"css": "src/app/globals.css"` (config file only, not used by build)
- ✅ **Documentation**: Some docs mention `src/` for historical context
- ✅ **No active code**: Apps and packages don't reference `src/`

### Conclusion:
**SAFE TO DELETE** - `src/` is legacy code from before monorepo migration. The build system uses `apps/*`, not `src/`.

### Cleanup Recommendation:
```bash
# Optional: Create backup first
git tag pre-src-cleanup
git commit -am "Before removing src/ directory"

# Delete src/ directory
rm -rf src/
```

---

## 2. Import Issues Status

### Current Build Errors:
The build errors are coming from **packages/lib** files, not apps/ files:
- ❌ `packages/lib/hooks/hooks/useUserRole.js` - uses `@/lib/utils/*`, `@/config/constants`
- ❌ `packages/lib/hooks/hooks/useWelcomeContext.js` - uses `@/lib/*`
- ❌ `packages/lib/stores/store/categoryStore.js` - uses `@/lib/utils/*`, `@/config/constants`
- ❌ `packages/lib/stores/store/pointsStore.js` - uses `@/lib/utils/*`, `@/config/constants`
- ❌ `packages/lib/stores/store/rewardStore.js` - uses `@/lib/utils/*`, `@/config/constants`
- ❌ `packages/lib/stores/store/usersStore.js` - uses `@/lib/utils/*`, `@/config/constants`
- ❌ `packages/lib/utils/utils/axios.js` - uses `@/config/constants`
- ❌ `packages/lib/utils/utils/rateLimit.js` - uses `@/config/constants`
- ❌ `packages/lib/utils/utils/auditLogger.js` - uses `@/lib/*`
- ❌ `packages/lib/utils/utils/withAudit.js` - uses `@/lib/*`

### Already Fixed:
- ✅ `packages/lib/hooks/hooks/useAuditLog.js` - fixed to use relative paths
- ✅ `packages/lib/stores/store/auditLogStore.js` - fixed to use relative paths

### Fix Pattern:
1. Replace `@/lib/utils/axios` with `../../utils/utils/axios.js`
2. Replace `@/lib/utils/notifications` with `../../utils/utils/notifications.js`
3. Replace `@/config/constants` with inline constants or remove dependency

---

## 3. Next Steps

1. **Fix remaining packages/lib files** (10 files need fixing)
2. **Fix QuizBuilder.jsx syntax error** (if it persists)
3. **Clean up src/ directory** (optional, safe to delete)
