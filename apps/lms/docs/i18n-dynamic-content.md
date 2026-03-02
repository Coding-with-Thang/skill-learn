# i18n for Dynamic Content and Database Entries

This doc describes how to handle **dynamic content** (API/runtime data) and **database-stored content** in a bilingual (en/fr) app using `next-intl` and your current stack.

---

## 1. Dynamic values in static UI (already supported)

When the **template** is fixed and only **values** change (e.g. user name, counts, dates), use message interpolation. No DB change needed.

**In messages (e.g. `en.json`):**
```json
{
  "training": {
    "coursesCount": "You have {count} courses",
    "welcomeUser": "Welcome, {name}!"
  }
}
```

**In code:**
```tsx
const t = useTranslations("training");
<p>{t("coursesCount", { count: courses.length })}</p>
<p>{t("welcomeUser", { name: user.firstName })}</p>
```

**Dates/numbers:** Use next-intl’s formatters (e.g. `useFormatter()` or `formatDateTimeRange`) so they follow the active locale.

---

## 2. Database content: when it must be translated

Your Prisma models (Course, Category, Changelog, Quiz, FlashCard, etc.) currently store **one string per field** (e.g. `title`, `description`, `content`). To support multiple languages you can:

- Store **one language** in the DB and treat it as the “source”; other locales can use machine translation, manual translation tables, or fallback to that language.
- Store **multiple languages** in the DB and pick by `locale` at read time (see options below).

---

## 3. Option A: JSON column per translatable field

Store a map of locale → text. Good for a small, fixed set of locales (e.g. en/fr).

**Schema (example for Course):**
```prisma
model Course {
  // ... existing fields
  titleJson       Json?   // e.g. { "en": "Introduction to React", "fr": "Introduction à React" }
  descriptionJson Json?  // same shape
  // Keep title/description for backward compatibility and fallback
  title           String
  description     String
}
```

**Type and helper:**
```ts
// e.g. in packages/database or apps/lms/lib/i18n-db.ts
export type LocalizedString = Record<string, string>; // { en: string, fr: string }

export function getLocalized(
  value: LocalizedString | string | null,
  locale: string,
  fallbackLocale = "en"
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value[fallbackLocale] ?? Object.values(value)[0] ?? "";
}
```

**When reading (e.g. in a Server Component or API):**
```ts
import { getLocale } from "next-intl/server";
import { getLocalized } from "@/lib/i18n-db";

const locale = await getLocale();
const course = await prisma.course.findUnique({ where: { id } });

const title = getLocalized(
  course?.titleJson as LocalizedString ?? course?.title,
  locale
);
const description = getLocalized(
  course?.descriptionJson as LocalizedString ?? course?.description,
  locale
);
```

**When writing (admin):** Save both a default string (e.g. `title`) and the JSON (`titleJson`) so existing code and fallbacks keep working.

---

## 4. Option B: Separate translation table (normalized)

Best when you have many locales or many entities. One row per (entity, locale).

**Schema (example):**
```prisma
model CourseTranslation {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  courseId   String   @db.ObjectId
  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  locale     String   // "en" | "fr"
  title      String
  description String?

  @@unique([courseId, locale])
  @@index([courseId])
  @@index([locale])
  @@map("course_translations")
}

model Course {
  // ... existing fields
  translations CourseTranslation[]
}
```

**When reading:**
```ts
const course = await prisma.course.findUnique({
  where: { id },
  include: {
    translations: {
      where: { locale: { in: [locale, "en"] } },
    },
  },
});

const tr = course.translations.find((t) => t.locale === locale)
  ?? course.translations.find((t) => t.locale === "en");
const title = tr?.title ?? course.title;
const description = tr?.description ?? course.description;
```

You can move this into a small helper or a `getCourseForLocale(id, locale)` in your courses lib.

---

## 5. Option C: Multiple columns per language

Simple and explicit; good for a fixed, small set of locales.

**Schema (example):**
```prisma
model Course {
  titleEn       String
  titleFr       String?
  descriptionEn String
  descriptionFr String?
  // ... rest
}
```

**When reading:**
```ts
const title = locale === "fr" ? (course.titleFr ?? course.titleEn) : course.titleEn;
const description = locale === "fr" ? (course.descriptionFr ?? course.descriptionEn) : course.descriptionEn;
```

---

## 6. Passing locale into data-fetching layers

- **Server Components / RSC:** Use `getLocale()` from `next-intl/server` and pass `locale` into any function that loads DB content.
- **API routes:** Accept `locale` from the request (e.g. query param, header, or from the session) and use it when resolving translated fields.
- **Client components:** Prefer resolving translations on the server and passing already-localized strings as props. If you must fetch on the client, send `locale` (e.g. from `useLocale()`) to the API.

Example in a page:

```ts
// app/[locale]/(lms)/(user)/training/courses/[courseId]/page.tsx
import { getLocale } from "next-intl/server";
import { getCourseForLocale } from "@/lib/courses"; // your helper that uses Option A/B/C

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const locale = await getLocale();
  const course = await getCourseForLocale(courseId, locale);
  return <CourseView course={course} />;
}
```

---

## 7. User-generated content (e.g. flash card text, comments)

Usually **not** auto-translated; you display the content as stored.

- If the product is “bilingual by author”: authors can create separate cards per language, or you store language on the card and filter by `locale` (e.g. show only cards where `card.locale === locale`).
- If you later add machine translation, you can store translations in a JSON column or translation table and fall back to the original when missing.

---

## 8. Summary

| Scenario | Approach |
|----------|----------|
| Counts, names, dates in UI | Interpolation + formatters in `next-intl` |
| Few entities, 2–3 locales | JSON column (`titleJson`) + `getLocalized()` |
| Many entities or many locales | Translation table (e.g. `CourseTranslation`) |
| Very simple, only en/fr | Optional: `titleEn` / `titleFr` columns |
| User-generated content | Show as-is, or tag by language and filter by `locale` |

Start with **Option A (JSON)** for one or two models (e.g. Course, Changelog) and a shared `getLocalized()` helper so the rest of the app stays locale-agnostic and only the data layer knows about translations.
