import type { MetadataRoute } from "next";
import { db } from "~/server/db";
import { env } from "~/env";
import { SUPPORTED_LOCALES } from "~/i18n/locales";
import { routing } from "~/i18n/routing";

export const revalidate = 3600;

function pathFor(locale: string, path: string) {
  return locale === routing.defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;
}

function localizedEntry(
  baseUrl: string,
  path: string,
  partial: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${baseUrl}${pathFor(l, path)}`])
  );
  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${baseUrl}${pathFor(locale, path)}`,
    alternates: { languages },
    ...partial,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXTAUTH_URL.startsWith("http")
    ? env.NEXTAUTH_URL
    : `https://${env.NEXTAUTH_URL}`;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    ...localizedEntry(baseUrl, "/", {
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    }),
    ...localizedEntry(baseUrl, "/compatibility-kviz", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...localizedEntry(baseUrl, "/contact", {
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    }),
    ...localizedEntry(baseUrl, "/privacy-policy", {
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    }),
  ];

  const [posts, users] = await Promise.all([
    db.post.findMany({ select: { id: true, updatedAt: true } }),
    db.user.findMany({
      select: {
        id: true,
        reviewsReceived: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.flatMap((post) =>
    localizedEntry(baseUrl, `/posts/${post.id}`, {
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const userEntries: MetadataRoute.Sitemap = users.flatMap((user) =>
    localizedEntry(baseUrl, `/users/${user.id}`, {
      lastModified: user.reviewsReceived[0]?.createdAt ?? now,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [...staticEntries, ...postEntries, ...userEntries];
}
