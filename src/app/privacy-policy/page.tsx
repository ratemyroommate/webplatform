import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("privacy.title"),
    description: t("privacy.description"),
  };
}

export default async function PrivacyPolicy() {
  const t = await getTranslations("privacy");
  return (
    <HydrateClient>
      <div
        className="mx-auto max-w-3xl p-6 text-gray-800 [&_h1]:mb-6 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: t.raw("content") as string }}
      />
    </HydrateClient>
  );
}
