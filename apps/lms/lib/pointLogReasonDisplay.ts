/** Maps point log `reason` values (with embedded IDs) to human-readable labels for admin UI. */

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export type PointLogReasonMaps = {
  quizTitleById: Map<string, string>;
  courseTitleById: Map<string, string>;
};

/** Normalizes entity ids for map lookup (trim + lowercase hex ids). */
export function normalizePointLogEntityId(id: string) {
  return id.trim().toLowerCase();
}

export function mapsFromCatalog(
  quizzes: readonly { id: string; title: string }[],
  courses: readonly { id: string; title: string }[]
): PointLogReasonMaps {
  return {
    quizTitleById: new Map(quizzes.map((q) => [normalizePointLogEntityId(q.id), q.title])),
    courseTitleById: new Map(courses.map((c) => [normalizePointLogEntityId(c.id), c.title])),
  };
}

const RESET_LOG_PREFIX = /^progress_reset_log:[a-fA-F0-9]{24}:(.*)$/;

/**
 * Collects quiz/course ids embedded in point log reasons (including nested
 * `progress_reset_log` tails) so we can resolve titles for inactive/archived content.
 */
export function collectReferencedQuizAndCourseIdsFromReasons(
  reasons: readonly (string | null | undefined)[]
): { quizIds: string[]; courseIds: string[] } {
  const quizIds = new Set<string>();
  const courseIds = new Set<string>();
  const visited = new Set<string>();

  function walk(raw: string | null | undefined) {
    const reason = (raw ?? "").trim();
    if (!reason || visited.has(reason)) return;
    visited.add(reason);

    const resetInner = reason.match(RESET_LOG_PREFIX);
    if (resetInner?.[1] != null) {
      walk(resetInner[1]);
      return;
    }

    const qc = reason.match(/^quiz_completed_(.+)$/);
    if (qc?.[1]) quizIds.add(qc[1]);

    const pb = reason.match(/^perfect_score_bonus_(.+)$/);
    if (pb?.[1]) quizIds.add(pb[1]);

    const cc = reason.match(/^course_completed_(.+)$/);
    if (cc?.[1]) courseIds.add(cc[1]);
  }

  for (const r of reasons) walk(r);
  return { quizIds: [...quizIds], courseIds: [...courseIds] };
}

/** Merge extra title rows into maps (e.g. from a supplemental DB fetch). */
export function mergeTitleRowsIntoMaps(
  base: PointLogReasonMaps,
  quizzes: readonly { id: string; title: string }[],
  courses: readonly { id: string; title: string }[]
): PointLogReasonMaps {
  return {
    quizTitleById: new Map([
      ...base.quizTitleById,
      ...quizzes.map((q) => [normalizePointLogEntityId(q.id), q.title] as const),
    ]),
    courseTitleById: new Map([
      ...base.courseTitleById,
      ...courses.map((c) => [normalizePointLogEntityId(c.id), c.title] as const),
    ]),
  };
}

function shortId(id: string) {
  return id.length > 8 ? `…${id.slice(-6)}` : id;
}

function formatInner(
  rawReason: string | null | undefined,
  maps: PointLogReasonMaps,
  depth: number
): string {
  if (depth > 8) return (rawReason ?? "").trim() || "—";

  const reason = (rawReason ?? "").trim();
  if (!reason) return "—";

  const resetLog = reason.match(/^progress_reset_log:([a-fA-F0-9]{24}):(.*)$/);
  if (resetLog) {
    const inner = resetLog[2] ?? "";
    const innerHuman = formatInner(inner, maps, depth + 1);
    return `Reversal of prior entry: ${innerHuman}`;
  }

  if (reason.startsWith("progress_reset_total:")) {
    const note = reason.slice("progress_reset_total:".length).trim();
    return note ? `Admin points reset: ${note}` : "Admin points reset";
  }

  const quizCompleted = reason.match(/^quiz_completed_(.+)$/);
  if (quizCompleted?.[1]) {
    const qid = quizCompleted[1].trim();
    const title = maps.quizTitleById.get(normalizePointLogEntityId(qid));
    return title ? `Quiz passed: ${title}` : `Quiz passed (${shortId(qid)})`;
  }

  const perfectBonus = reason.match(/^perfect_score_bonus_(.+)$/);
  if (perfectBonus?.[1]) {
    const qid = perfectBonus[1].trim();
    const title = maps.quizTitleById.get(normalizePointLogEntityId(qid));
    return title ? `Perfect score bonus: ${title}` : `Perfect score bonus (${shortId(qid)})`;
  }

  if (reason.startsWith("points_spent_")) {
    const tail = reason.slice("points_spent_".length).trim();
    if (OBJECT_ID.test(tail)) {
      return `Points spent (${shortId(tail)})`;
    }
    return tail || "Points spent";
  }

  const courseCompleted = reason.match(/^course_completed_(.+)$/);
  if (courseCompleted?.[1]) {
    const cid = courseCompleted[1].trim();
    const title = maps.courseTitleById.get(normalizePointLogEntityId(cid));
    return title ? `Course completed: ${title}` : `Course completed (${shortId(cid)})`;
  }

  return reason;
}

export function formatPointLogReasonDisplay(
  rawReason: string | null | undefined,
  maps: PointLogReasonMaps
): string {
  return formatInner(rawReason, maps, 0);
}
