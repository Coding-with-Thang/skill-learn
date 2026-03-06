"use client";

import { usePathname } from "@/i18n/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@skill-learn/ui/components/sidebar";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import Footer from "@/components/layout/Footer";
import { PageErrorBoundary } from "@/components/layout/PageErrorBoundary";
import TopBar from "@/components/layout/TopBar";

const SEGMENT_KEYS: Record<string, string> = {
  dashboard: "dashboard",
  categories: "categories",
  courses: "courses",
  create: "create",
  edit: "edit",
  preview: "preview",
  quizzes: "quizzes",
  "quiz-manager": "quizManager",
  rewards: "rewards",
  users: "users",
  roles: "roles",
  "user-roles": "userRoles",
  settings: "settings",
  "audit-logs": "auditLogs",
  billing: "billing",
  features: "features",
  documentation: "documentation",
  "flashcards-analytics": "flashcardsAnalytics",
  "flashcards-cards": "flashcardsCards",
  "flashcards-categories": "flashcardsCategories",
  "flashcards-import": "flashcardsImport",
  "flashcards-learning-analytics": "flashcardsLearningAnalytics",
  "flashcards-priorities": "flashcardsPriorities",
  "course-status": "courseStatus",
  "quiz-status": "quizStatus",
};

export default function DashboardLayout({ children }) {
  const t = useTranslations("adminLayout");
  const pathname = usePathname();

  const formatSegmentLabel = (segment: string) => {
    const key = segment.toLowerCase();
    const tKey = SEGMENT_KEYS[key];
    if (tKey) return t(tKey as keyof typeof t);
    if (/^[0-9a-f-]{36}$/i.test(segment) || /^[0-9a-f]{24}$/i.test(segment)) {
      return t("detail");
    }
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const { crumbs, endtrail } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return { crumbs: [], endtrail: t("dashboard") };
    }

    if (segments.length === 1 && segments[0] === "dashboard") {
      return { crumbs: [], endtrail: t("dashboardOverview") };
    }

    // Shortened trail for lesson edit: remove "Detail" segments
    const lessonEditMatch = pathname.match(
      /^\/dashboard\/courses\/([^/]+)\/chapters\/([^/]+)\/lessons\/([^/]+)\/edit\/?$/,
    );
    if (lessonEditMatch) {
      const [, courseId] = lessonEditMatch;
      return {
        crumbs: [
          { name: t("dashboard"), href: "/dashboard" },
          { name: t("courses"), href: "/dashboard/courses" },
          { name: t("chapters"), href: `/dashboard/courses/${courseId}/edit` },
          { name: t("lessons"), href: `/dashboard/courses/${courseId}/edit` },
        ],
        endtrail: t("edit"),
      };
    }

    // Shortened trail for chapter edit or other course nested paths: remove "Detail" segments
    const chapterMatch = pathname.match(
      /^\/dashboard\/courses\/([^/]+)\/chapters\/([^/]+)(?:\/|$)/,
    );
    if (chapterMatch) {
      const [, courseId] = chapterMatch;
      return {
        crumbs: [
          { name: t("dashboard"), href: "/dashboard" },
          { name: t("courses"), href: "/dashboard/courses" },
          { name: t("chapters"), href: `/dashboard/courses/${courseId}/edit` },
        ],
        endtrail: formatSegmentLabel(segments[segments.length - 1] ?? ""),
      };
    }

    // Shortened trail for course edit/preview: remove "Detail" for courseId
    const courseEditMatch = pathname.match(
      /^\/dashboard\/courses\/([^/]+)\/(edit|preview)(?:\/|$)/,
    );
    if (courseEditMatch) {
      const [, , action] = courseEditMatch;
      return {
        crumbs: [
          { name: t("dashboard"), href: "/dashboard" },
          { name: t("courses"), href: "/dashboard/courses" },
        ],
        endtrail: formatSegmentLabel(action ?? ""),
      };
    }

    // Build full trail: every segment except the last becomes a crumb; last is endtrail
    // Skip segments that format to "Detail" to shorten ID-heavy paths
    const crumbs: { name: string; href: string }[] = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      const label = formatSegmentLabel(segment ?? "");
      if (label === t("detail")) continue;
      const href = `/${segments.slice(0, i + 1).join("/")}`;
      crumbs.push({ name: label, href });
    }
    const lastSegment = segments[segments.length - 1];
    const endtrail = formatSegmentLabel(lastSegment ?? "");

    return { crumbs, endtrail };
  }, [pathname, t]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-background">
        <TopBar adminMode={true} />
        <main className="flex-1 flex flex-col p-4 sm:p-8 w-full min-w-0 gap-6 overflow-y-auto">
          <BreadCrumbCom crumbs={crumbs} endtrail={endtrail} />
          <PageErrorBoundary pageName="Dashboard">
            {children}
          </PageErrorBoundary>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
