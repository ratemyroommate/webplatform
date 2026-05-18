import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { Kviz } from "~/app/_components/Kviz";
import { getServerAuthSession } from "~/server/auth";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BackToFeed } from "~/components/ui/back-to-feed";
import { alternatesFor } from "~/i18n/seo";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("kviz.title"),
    description: t("kviz.description"),
    alternates: alternatesFor(locale, "/compatibility-kviz"),
  };
}

export default async function Page({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const session = await getServerAuthSession();
  const t = await getTranslations("kviz");

  return (
    <HydrateClient>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <BackToFeed />

        <h1
          className="text-foreground font-extrabold tracking-[-0.02em]"
          style={{ fontSize: 30, lineHeight: 1.15 }}
        >
          {t("title")}
        </h1>

        <p
          className="text-[14px] leading-[1.55] text-[color:var(--ink-70)]"
          dangerouslySetInnerHTML={{ __html: t.raw("description") as string }}
        />

        {session ? (
          <Kviz />
        ) : (
          <div className="rounded-2xl border border-[color:var(--ink-10)] bg-[var(--card)] p-8 text-center text-[14px] text-[color:var(--ink-70)]">
            {t("loginRequired")}
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
