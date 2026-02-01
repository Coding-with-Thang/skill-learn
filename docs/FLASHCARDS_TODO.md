# Flash Cards Feature — Future Enhancements

## Completed in initial implementation

- Prisma schema (all models)
- SM-2 utility functions
- Priority resolution utilities
- Study session API with weighted shuffle
- Progress API (SM-2 updates)
- Categories, cards, decks CRUD APIs
- Accept shared cards (fingerprint dedup)
- Home API with recommended virtual decks
- Zustand stores (study, deck builder)
- Core UI: Home, Study, Deck Builder, Create Card, Create Category
- Navigation link

## TODOs for future enhancements

### 1. Admin analytics & auto-suggestions

- **Aggregation job**: Scheduled job to aggregate `FlashCardProgress` by category (avgExposure, avgMastery, stagnation signals)
- **Suggestion rules**: e.g. high exposure + low mastery → increase priority; high mastery + high exposure → decrease priority
- **Admin UI**: Endpoint and UI for admins to view suggestions and explicitly apply or dismiss (never auto-apply)
- **Model**: `FlashCardCategoryPrioritySuggestion` exists; wire up generation and admin UI

### 2. Admin priority & override settings UI

- API endpoints for `CategoryPriorityAdmin` CRUD
- API for `FlashCardPrioritySettings` (override mode)
- Admin dashboard section for flash card priorities and override mode
- Category-level priority (1–10) management

### 3. User priority settings

- API for `CategoryPriorityUser` CRUD
- User-facing UI to set personal category priorities

### 4. Needs Attention / Company Focus filtering in study session

- "Needs Attention" virtual deck: filter by `masteryScore < 0.4` and `exposureCount >= 2` in study-session logic
- "Company Focus": already uses `categoryIds` from admin priorities; verify end-to-end

### 5. Sharing flow (share cards with users)

- API to share a card (set `isPublic` or add a share mechanism)
- UI to share cards and accept shared cards (accept API exists)
- Optional: share entire decks

### 6. Fork card option

- Spec mentions "optionally allow forking later" — add fork endpoint that duplicates a shared card into user's owned cards

### 7. Feature flag

- Add `flash_cards` to `Feature` table (seed/migration)
- Add `feature: 'flash_cards'` to nav item in Navigation.jsx to gate by tenant

### 8. Admin flash card management

- Admin UI to create/edit/delete cards and categories
- Bulk import cards (CSV/JSON)

### 9. Learning analytics dashboard

- User-facing: exposure vs mastery charts
- Admin-facing: aggregate analytics per category/tenant
