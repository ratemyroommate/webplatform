import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { isSupported, type Locale } from "./locales";

const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  hu: () => import("../../messages/hu.json"),
  en: () => import("../../messages/en.json"),
};

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const raw = cookieStore.get("locale")?.value ?? "hu";
  const locale: Locale = isSupported(raw) ? raw : "hu";

  const messages = (await messageLoaders[locale]()).default;

  return { locale, messages };
});
