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

### 1. Admin analytics & auto-suggestions ✅ DONE

- **Aggregation job**: `POST /api/admin/flashcards/suggestions/generate` — aggregates `FlashCardProgress` by category (avgExposure, avgMastery)
- **Suggestion rules**: high exposure + low mastery → increase priority; high mastery + high exposure → decrease priority
- **Admin UI**: `/dashboard/flashcards-analytics` — view suggestions, apply or dismiss (never auto-apply)
- **Model**: `FlashCardCategoryPrioritySuggestion` wired up

### 2. Admin priority & override settings UI ✅ DONE

- **API**: `GET/POST /api/admin/flashcards/priorities` — list categories with admin priorities, upsert single
- **API**: `GET/PATCH /api/admin/flashcards/settings` — FlashCardPrioritySettings (override mode)
- **Admin UI**: `/dashboard/flashcards-priorities` — category priorities (1–10) and override mode

### 3. User priority settings ✅ DONE

- **API**: `GET/POST /api/flashcards/priorities` — list categories with user priorities, upsert single
- **User UI**: `/flashcards/priorities` — set personal category priorities (1–10), linked from home

### 4. Needs Attention / Company Focus filtering in study session ✅ DONE

- **Needs Attention**: study-session filters by `masteryScore < 0.4` and `exposureCount >= 2`
- **Company Focus**: home API returns `categoryIds` from admin priorities (top categories with priority ≥7); study-session filters cards to those categories

### 5. Sharing flow (share cards with users) ✅ DONE

- API to share a card: `isPublic` on FlashCard; accept API exists
- Deck sharing: `isPublic` on FlashCardDeck; share toggle in Manage deck
- UI: Shared decks appear in "Shared by Others" on home; Accept creates independent copy
- Accept deck: `POST /api/flashcards/decks/accept` — creates **copy** owned by user; modifications don't affect original
- Move cards: Remove from deck (Manage deck); Add/remove via Deck Builder (edit mode)
- Cards in multiple decks: Supported (same cardId in multiple deck.cardIds)
- Categories: Recommendation only — deck builder allows any cards; categories for organization

### 6. Permissions & tenant architecture ✅ DONE

- **Permissions**: flashcards.create, flashcards.read, flashcards.update, flashcards.delete, flashcards.manage_tenant, flashcards.manage_global
- **Schema**: isGlobal on FlashCard and FlashCardCategory for platform-wide content
- **API**: Permission checks on cards, categories, home, study-session, decks; include global cards in queries
- **Seed**: `npm run seed:flashcard-permissions` to add permissions to Permission table. Then assign flashcards.create and flashcards.read to Member/User role in role templates so users can create and study.
- **Feature**: flash_cards feature defaulted on (tenant architecture)

### 7. Fork card option

- Spec mentions "optionally allow forking later" — add fork endpoint that duplicates a shared card into user's owned cards

### 7. Feature flag ✅ DONE

- **Feature table**: `flash_cards` added to DEFAULT_FEATURES in CMS `/api/features/seed` — run seed (or POST to that endpoint as super admin) to create
- **Nav gating**: Navigation.jsx, Sidebar, MobileSidebar, app-sidebar already use `feature: 'flash_cards'`

### 8. Admin flash card management ✅ DONE

- **Admin UI**: `/dashboard/flashcards-cards` — list, edit, delete cards; filter by category
- **Admin UI**: `/dashboard/flashcards-categories` — create, edit, delete categories
- **Bulk import**: `/dashboard/flashcards-import` — CSV (question,answer) or JSON; duplicates skipped

### 9. Learning analytics dashboard ✅ DONE

- **User**: `/flashcards/analytics` — exposure vs mastery by category, summary stats
- **Admin**: `/dashboard/flashcards-learning-analytics` — aggregate by category (cards, users, avg exposure, avg mastery)
