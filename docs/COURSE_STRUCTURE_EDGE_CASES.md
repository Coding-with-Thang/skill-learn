# Course Structure – Edge Cases & Planning

This doc covers edge cases and improvements to consider for the course structure (chapters & lessons) feature.

---

## Already Handled

- **Delete failure**: Toast + `refreshCourse({ silent: true })` so UI matches server.
- **Reorder partial failure**: `Promise.all` reject → toast + refresh; server may be partially updated, refresh shows current server state.
- **Chapter/lesson ownership**: APIs validate `chapter.courseId`, `lesson.courseChapterId` + `courseChapter.courseId`.
- **Cascade delete**: Deleting a chapter deletes its lessons (Prisma `onDelete: Cascade`).
- **Empty course**: Empty state with “Add chapter” when no chapters.
- **Null course**: `course?.chapters ?? []` avoids crashes when course is loading or missing.

---

## Edge Cases & Recommendations

### 1. **Reorder API – partial success** ✅ Implemented

**Issue**: Reorder sends N separate PATCHs. If some succeed and one fails, server has a mixed order and we only refresh after the first failure.

**Implemented**: Single transactional endpoints:

- `PUT /api/admin/courses/[courseId]/chapters/reorder` with body `{ chapterIds: string[] }`
- `PUT /api/admin/courses/[courseId]/chapters/[chapterId]/lessons/reorder` with body `{ lessonIds: string[] }`

Both use `prisma.$transaction()` so either all positions are updated or none are.

---

### 2. **Rapid / duplicate actions** ✅ Implemented

**Issue**: User double-clicks “Add chapter”, or reorders then immediately deletes. Requests can complete out of order; UI can briefly show wrong state.

**Implemented**:

- Single `structureMutationPending` flag on the edit page: set `true` at the start of any structure mutation (add chapter/lesson, reorder chapters/lessons, delete chapter/lesson), and `false` in `finally`.
- `CourseStructure` receives `mutationPending`: “Add chapter”, “Add lesson”, drag handles, and delete (trash) buttons are disabled while pending.
- Reorder handlers guard with `if (structureMutationPending) return` and set pending before the request, so a second reorder (e.g. drag again before the first completes) is ignored.

---

### 3. **Renaming chapters and lessons**

**Issue**: New items are created as “New Chapter” / “New Lesson”. There’s no inline or modal edit for title.

**Implemented (add with title only)**:

- When adding a chapter or lesson, a dialog opens so the user can enter a title before creating. Defaults are “New Chapter” and “New Lesson”; the user can edit or accept. Creation uses the existing `POST` with the chosen `title`. Dialog copy notes that renaming later will be done in the course wizard.

**Planned (rename)**:

- Renaming existing chapters or lessons will be implemented later via a **course wizard** (user will be redirected there). Do not add inline/dialog rename in the structure view for now.

---

### 4. **Moving a lesson to another chapter**

**Issue**: Lessons can only be reordered inside one chapter. Moving a lesson to a different chapter isn’t supported.

**Recommendation** (if product needs it):

- Allow drag-and-drop of a lesson onto another chapter (or a “Move to chapter” menu).
- API: `PATCH .../lessons/[lessonId]` with `courseChapterId` and `position` (or a dedicated “move” endpoint that updates chapter + position in one go).

---

### 5. **Stale data after delete** ✅ Mitigated

**Issue**: User A deletes a chapter. User B (same course, other tab) still has it; their next reorder might send that chapter’s id and get 404.

**Current behavior**: Reorder fails → toast + refresh → B sees server state (chapter gone). Acceptable.

**Implemented**: On the course edit page, when the tab becomes visible again (Page Visibility API: `visibilitychange` → `visible`), we call `refreshCourse({ silent: true })`. So when User B switches back to the edit tab, they get fresh data before doing reorder, reducing 404s from stale chapter/lesson ids. No real-time or optimistic updates; refresh-on-focus is lightweight and sufficient for the multi-tab case.

---

### 6. **Very long lists**

**Issue**: Many chapters/lessons (e.g. 50+) can make the list heavy (many sortable nodes, re-renders).

**Recommendation**:

- If needed, virtualize the list (e.g. only render visible chapters/lessons). Drag-and-drop and virtualization together are non-trivial; consider only if you hit performance issues.
- Alternatively, cap or warn at a high count (e.g. “Consider splitting into multiple courses”).

---

### 7. **Title validation** ✅ Implemented

**Issue**: APIs accept any string for title; empty or very long titles are allowed.

**Implemented**:

- **API**: Chapter and lesson create/update validate title: trimmed, min length 1, max 200. Return 400 with `fieldErrors: { title: ["..."] }` for validation failures. Error handler always includes `fieldErrors` in the JSON response for validation errors.
- **UI**: Add Chapter and Add Lesson dialogs validate before submit (required, max 200). Errors are shown **inline** below the title input (red text, `role="alert"`, `aria-invalid` / `aria-describedby` on the input). No toast for validation or API field errors; only success toasts. Server-side validation errors are displayed in the same inline area.

---

### 8. **Position values** ✅ Implemented

**Issue**: PATCH accepts any number for `position`; negative or very large values could create odd ordering.

**Implemented**:

- **Chapter PATCH**: When `position` is provided, it must be a non-negative integer; otherwise return 400 with `fieldErrors.position`. Valid values are clamped to `0 .. chapterCount - 1` for the course.
- **Lesson PATCH**: Same for lesson position within the chapter: non-negative integer, clamped to `0 .. lessonCount - 1`.
- Reorder endpoints assign position by index, so they remain valid; no change. Client continues to send `0, 1, 2, ...` for reorder.

---

### 9. **Loading / flicker during refresh** ✅ Implemented

**Issue**: After add/reorder/delete we call `refreshCourse()`. There can be a short delay before new data arrives; list might flicker or show old state briefly.

**Implemented**:

- `structureRefreshing` state is set true only during the refresh that follows a **successful** structure mutation (add chapter/lesson, reorder, delete). Set false when that refresh completes.
- The structure card shows a light overlay (semi-transparent background + spinner) over the content while `structureRefreshing` is true, so the list doesn’t flicker with stale data. Overlay uses `aria-busy` and `aria-live` for accessibility.
- Or keep current behavior and only add this if users report confusion.

---

### 10. **Permissions and multi-tenancy** ✅ Implemented

**Issue**: Right now `requireAdmin()` is the only check. If you introduce tenants or course-level owners/editors, some users may only be allowed to edit certain courses.

**Implemented**:

- **`requireCanEditCourse(courseId)`** in `packages/lib/utils/auth.js`: loads the course and current user; if the course has a `tenantId`, the user must be in that tenant (`isUserInTenant`) and must have one of `courses.update`, `courses.create`, `courses.delete` or any existing admin permission in that tenant; if the course is global (`tenantId` null), the user must have course-edit or admin permission in their tenant, or be a legacy admin (OPERATIONS/MANAGER). Returns 403/404 as appropriate.
- **Course, chapter, and lesson admin routes** now use `requireCanEditCourse(courseId)` instead of `requireAdmin()`. No separate permission check for chapters or lessons: if the user can edit the course, they can edit its chapters and lessons (best practice: one resource-level check at the course boundary).

---

### 11. **Keyboard and a11y**

**Issue**: Sortable lists should be keyboard-accessible (focus, reorder with keyboard).

**Recommendation**:

- Confirm `@dnd-kit` keyboard sensor works as expected (focus management, arrows, etc.).
- Ensure all buttons (delete, add lesson, expand) are focusable and have clear labels (you already use `aria-label` in places).

---

### 12. **Last chapter / last lesson**

**Issue**: Deleting the only chapter (or the only lesson in a chapter) is allowed. No special handling.

**Recommendation**: No change required unless you want to block deleting the last chapter (e.g. “Course must have at least one chapter”). Currently you allow empty structure.

---

## Quick wins (no doc change needed)

- **Debounce or guard reorder**: Ignore or coalesce reorder calls if the previous reorder request is still in flight.
- **Single reorder endpoints**: ✅ Done. Use `PUT .../chapters/reorder` and `PUT .../lessons/reorder` with transactional updates.
- **Add with title**: ✅ Done. Dialog for chapter/lesson title when adding. Rename of existing items will use course wizard (planned).

---

## Summary

| Area              | Status / risk              | Action (optional)                          |
|-------------------|----------------------------|--------------------------------------------|
| Partial reorder   | Bulk reorder API (done)     | —                                         |
| Double submit     | Disabled while pending (done) | —                                         |
| Rename            | Add-with-title done; rename → wizard later | Course wizard for rename (planned)         |
| Move lesson       | Not supported              | Move-to-chapter UX + API                   |
| Stale data        | Refresh on tab focus (done) | —                                         |
| Long lists        | May be slow                | Virtualize or cap only if needed           |
| Title/position    | Title + position (done)     | —                                         |
| Loading           | Overlay during refresh (done) | —                                        |
| Permissions       | requireCanEditCourse (done) | —                                         |
