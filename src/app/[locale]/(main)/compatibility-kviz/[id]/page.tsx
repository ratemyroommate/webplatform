import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { CompletedKviz } from "~/app/_components/CompletedKviz";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card } from "~/components/ui/card";
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
      <Card className="w-full gap-6 p-4">
        {session ? (
          <CompletedKviz userId={id} />
        ) : (
          <div className="text-center">{t("loginRequiredAnswers")}</div>
        )}
      </Card>
    </HydrateClient>
  );
}
