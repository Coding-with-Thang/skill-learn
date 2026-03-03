# next-intl Implementation Audit

**Scope:** LMS and public pages/components only. CMS is excluded (no multi-language).

**Date:** March 3, 2025

---

## Summary

| Category | With next-intl | Needs next-intl |
|----------|----------------|-----------------|
| LMS Admin pages | 0 | 24 |
| LMS User pages | 13 | 1 |
| Public pages | 20 | 0 |
| LMS Components | 25 | 23 |

---

## LMS Admin Pages — NEED next-intl

All admin dashboard pages under `app/[locale]/(lms)/(admin)/dashboard/` have hardcoded strings and require `useTranslations` or `getTranslations`:

| Page | Path | Notes |
|------|------|-------|
| Dashboard | `dashboard/page.tsx` | Stats cards ("Total Users", "Active Rewards", "vs last month", etc.), charts, activity feed |
| Courses list | `dashboard/courses/page.tsx` | Server component; labels, filters, empty states |
| Course create | `dashboard/courses/create/page.tsx` | Form labels, buttons, validation messages |
| Course edit | `dashboard/courses/[courseId]/edit/page.tsx` | Form labels, buttons |
| Course preview | `dashboard/courses/[courseId]/preview/page.tsx` | UI labels, buttons |
| Lesson view | `dashboard/courses/.../lessons/[lessonId]/page.tsx` | Lesson UI labels |
| Lesson edit | `dashboard/courses/.../lessons/[lessonId]/edit/page.tsx` | Form labels |
| Categories | `dashboard/categories/page.tsx` | CRUD labels, form fields |
| Flashcards categories | `dashboard/flashcards-categories/page.tsx` | Table headers, dialogs, buttons |
| Flashcards cards | `dashboard/flashcards-cards/page.tsx` | Card management UI |
| Flashcards priorities | `dashboard/flashcards-priorities/page.tsx` | Priority UI labels |
| Flashcards import | `dashboard/flashcards-import/page.tsx` | Import UI, instructions |
| Flashcards analytics | `dashboard/flashcards-analytics/page.tsx` | Chart labels, stats |
| Flashcards learning analytics | `dashboard/flashcards-learning-analytics/page.tsx` | Section title, table headers |
| Quizzes | `dashboard/quizzes/page.tsx` | Table, filters, actions |
| Quiz manager | `dashboard/quizzes/quiz-manager/page.tsx` | Wraps QuizBuilder (component needs i18n) |
| Features | `dashboard/features/page.tsx` | Feature flags UI |
| Users | `dashboard/users/page.tsx` | Table, dialogs, actions |
| Roles | `dashboard/roles/page.tsx` | Role management UI (large) |
| User roles | `dashboard/user-roles/page.tsx` | Assignments UI |
| Audit logs | `dashboard/audit-logs/page.tsx` | Table, filters, date labels |
| Rewards | `dashboard/rewards/page.tsx` | Reward catalog UI |
| Billing | `dashboard/billing/page.tsx` | Plan labels, upgrade UI |
| Settings | `dashboard/settings/page.tsx` | Section labels |
| Settings form | `dashboard/settings/SettingsForm.tsx` | Form fields, buttons |

---

## LMS User Pages — Status

| Page | Path | Status |
|------|------|--------|
| Home | `(user)/home/page.tsx` | ✅ Composes widgets (all use next-intl) |
| User stats | `(user)/user/stats/page.tsx` | ✅ Delegates to UserStats (has next-intl) |
| Games | `(user)/games/page.tsx` | ✅ Has next-intl |
| **Game detail** | `(user)/games/[gameName]/page.tsx` | ❌ **NEEDS** — GAME_REGISTRY has hardcoded titles, rules, tips |
| Training, Discover, Achievements, Leaderboard, Rewards | various | ✅ Have next-intl |
| Flashcards (all) | various | ✅ Have next-intl |
| Quiz (all) | various | ✅ Have next-intl |
| Courses | various | ✅ Have next-intl |

---

## Public Pages — Status

All public pages under `app/[locale]/(public)/` already use next-intl:
- about, careers, changelog, contact, features, legal/*, pricing, resources, sitemap, support/faq, video-ad

---

## LMS Components — NEED next-intl

### Landing (used on public landing page)

| Component | Path | Notes |
|-----------|------|-------|
| BuiltForEveryone | `landing/BuiltForEveryone.tsx` | "WHY SKILL-LEARN", stats, cards, CTAs |
| VersatilePlatform | `landing/VersatilePlatform.tsx` | Tabs, CONTENT object (Courses, Quizzes, etc.) |
| SkillLearnHere | `landing/SkillLearnHere.tsx` | "New Performance Suite", CTAs |
| FAQ | `landing/FAQ.tsx` | faqs array (questions/answers) |
| Testimonials | `landing/Testimonials.tsx` | testimonials array, "Success Stories" |

### Games (user-facing)

| Component | Path | Notes |
|-----------|------|-------|
| MemoryGame | `games/MemoryGame.tsx` | Difficulty labels, "Play Again", timer, etc. |
| RockPaperScissors | `games/RockPaperScissors.tsx` | "Rock", "Paper", "Scissors", "You Win!", "It's a Tie!" |

### Quiz

| Component | Path | Notes |
|-----------|------|-------|
| QuizModal | `quiz/QuizModal.tsx` | Large `quizCategories` object with questions/options (Science, etc.) |

### Admin

| Component | Path | Notes |
|-----------|------|-------|
| TenantSummary | `admin/TenantSummary.tsx` | "Organization Overview", tier badges, status labels |
| UserForm | `user/UserForm.tsx` | Form labels, validation |
| UserDetails | `user/UserDetails.tsx` | "Profile Details", "Member since" |
| UserFilters | `user/UserFilters.tsx` | "Search users...", "Filter by Role", "All Roles" |
| CourseFilters | `courses/CourseFilters.tsx` | "Category", "All Categories", "Per page" |
| QuizBuilder | `admin/QuizBuilder.tsx` | Quiz creation UI (verify) |
| RewardForm | `admin/rewards/RewardForm.tsx` | Form fields (verify) |
| ExposureMasteryBarChart | `flashcards/ExposureMasteryBarChart.tsx` | Chart labels (verify) |

### Shared

| Component | Path | Notes |
|-----------|------|-------|
| Pagination | `shared/Pagination.tsx` | "Previous", "Next" |

---

## Components — Already have next-intl ✅

- BreadCrumb, CookieConsent, ScrollToTop
- DashboardLayout, MobileSidebar, Sidebar, app-sidebar, TopBar, TopBanner, Footer, PublicLayout
- SearchCommand, LayoutWrapper, LanguageSwitcher
- HeroSection, LandingHeader, LandingFooter, PricingSection
- WelcomeBanner, UserStats, LeaderboardWidget, AchievementsWidget, DailyActivitiesWidget, TopicProgressWidget, PointsRewardsWidget
- GuessingGame, TicTacToe, GameRunner, GamePlayLayout
- StudySetupView, StudyResultsView, ShareDecksDialog

---

## Recommended Implementation Order

1. **High visibility (public):** BuiltForEveryone, VersatilePlatform, SkillLearnHere, FAQ, Testimonials
2. **User-facing games:** games/[gameName]/page.tsx (GAME_REGISTRY), MemoryGame, RockPaperScissors
3. **QuizModal:** Large content; consider moving quiz data to JSON/messages
4. **Admin dashboard:** Start with dashboard/page.tsx, then courses, users, roles
5. **Admin components:** TenantSummary, UserForm, UserDetails, UserFilters
6. **Supporting:** CourseFilters, Pagination, CourseStructure, CourseActions, etc.

---

## Translation Keys Convention

Existing namespaces in `messages/en.json`: admin, auth, banner, breadcrumbs, careers, common, contact, cookie, discover, faq, features, flashcards, footer, footerLanding, games, greetings, hero, home.*, legal, landing, nav, onboarding, pricing, quiz, quizResults, quizStart, resources, rewards, search, sitemap, stats, training, videoAd

**Suggested new namespaces:**
- `adminDashboard` — dashboard stats, charts
- `adminCourses`, `adminFlashcards`, `adminQuizzes`, `adminUsers`, `adminRoles`, `adminRewards`, `adminBilling`, `adminSettings`, `adminAudit`
- `landing.*` — extend for BuiltForEveryone, VersatilePlatform, SkillLearnHere, FAQ, Testimonials
- `quizModal` — for QuizModal content (or use structured JSON)
