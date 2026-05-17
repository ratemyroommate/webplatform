import { defineRouting } from "next-intl/routing";
import { SUPPORTED_LOCALES } from "./locales";

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: "hu",
  localePrefix: "as-needed",
  localeDetection: false,
});
