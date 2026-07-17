import { notFound } from "next/navigation";

/**
 * Catch-all for URLs that don't match any route within a locale. Triggering
 * `notFound()` here renders the localized `[locale]/not-found.tsx` boundary,
 * which is the next-intl-friendly way to handle unmatched routes (a root
 * `app/not-found.tsx` can't be used because the layout lives under `[locale]`).
 */
export default function CatchAllNotFound() {
  notFound();
}
