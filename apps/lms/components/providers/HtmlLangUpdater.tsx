"use client";

import { useEffect } from "react";

type Props = {
  locale: string;
};

/**
 * Keeps the <html lang="..."> attribute in sync during client-side locale
 * navigation. The root layout sets the initial value on the server, but since
 * it is a shared segment it does not re-render on client-side transitions.
 * This lightweight component bridges that gap.
 */
export function HtmlLangUpdater({ locale }: Props) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
