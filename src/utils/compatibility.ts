import type { CompatibilityCategory } from "@prisma/client";

export const COMPATIBILITY_CATEGORIES = ["LIFESTYLE", "SOCIAL", "BOUNDARIES"] as const;

export type CategoryKey = (typeof COMPATIBILITY_CATEGORIES)[number];

export type CategoryBucket = "low" | "balanced" | "high";

export type CategoryMeta = {
  key: CategoryKey;
  /** lowercase i18n key under compatibility.categories.* */
  i18nKey: "lifestyle" | "social" | "boundaries";
  /** CSS variable name for the pastel donut color */
  colorVar: string;
};

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  LIFESTYLE: {
    key: "LIFESTYLE",
    i18nKey: "lifestyle",
    colorVar: "--category-lifestyle",
  },
  SOCIAL: {
    key: "SOCIAL",
    i18nKey: "social",
    colorVar: "--category-social",
  },
  BOUNDARIES: {
    key: "BOUNDARIES",
    i18nKey: "boundaries",
    colorVar: "--category-boundaries",
  },
};

/**
 * Bucket assignment for a user's category total (max 4 with 2 questions).
 * Low: 0–1, Balanced: 2, High: 3–4.
 */
export const bucketFor = (total: number, max: number): CategoryBucket => {
  if (max <= 0) return "balanced";
  const ratio = total / max;
  if (ratio < 0.375) return "low"; // 0/4, 1/4
  if (ratio < 0.625) return "balanced"; // 2/4
  return "high"; // 3/4, 4/4
};

export const isCategoryKey = (value: string): value is CategoryKey =>
  (COMPATIBILITY_CATEGORIES as readonly string[]).includes(value);

export const toCategoryKey = (value: CompatibilityCategory): CategoryKey => value;
