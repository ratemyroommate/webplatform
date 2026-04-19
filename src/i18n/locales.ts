export const SUPPORTED_LOCALES = ["hu", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isSupported(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export const LOCALE_OPTIONS = [
  { code: "hu" as Locale, flag: "🇭🇺", label: "Magyar" },
  { code: "en" as Locale, flag: "🇬🇧", label: "English" },
] as const;
