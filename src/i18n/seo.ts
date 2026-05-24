import type { Metadata } from "next";
import { env } from "~/env";
import { SUPPORTED_LOCALES } from "./locales";
import { routing } from "./routing";

const baseUrl = env.NEXTAUTH_URL.startsWith("http")
  ? env.NEXTAUTH_URL
  : `https://${env.NEXTAUTH_URL}`;

export function getBaseUrl() {
  return baseUrl;
}

export function pathForLocale(locale: string, path: string) {
  return locale === routing.defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;
}

export function alternatesFor(
  locale: string,
  path: string
): NonNullable<Metadata["alternates"]> & { canonical: string } {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${baseUrl}${pathForLocale(l, path)}`])
  );
  return {
    canonical: pathForLocale(locale, path),
    languages: { ...languages, "x-default": `${baseUrl}${path}` },
  };
}
