import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { CompletedKviz } from "~/app/_components/CompletedKviz";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BackToFeed } from "~/components/ui/back-to-feed";
import { alternatesFor } from "~/i18n/seo";

type KvizPageProps = { params: { id: string; locale: string } };

export async function generateMetadata({
  params: { id, locale },
}: KvizPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("kviz.title"),
    description: t("kviz.description"),
    alternates: alternatesFor(locale, `/compatibility-kviz/${id}`),
  };
}

export default async function Page({ params: { id, locale } }: KvizPageProps) {
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

        {session ? (
          <CompletedKviz userId={id} />
        ) : (
          <div className="rounded-2xl border border-[color:var(--ink-10)] bg-[var(--card)] p-8 text-center text-[14px] text-[color:var(--ink-70)]">
            {t("loginRequiredAnswers")}
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
