import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import type { Locale } from "./locales";

const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  hu: () => import("../../messages/hu.json"),
  en: () => import("../../messages/en.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await messageLoaders[locale]()).default;

  return { locale, messages };
});
