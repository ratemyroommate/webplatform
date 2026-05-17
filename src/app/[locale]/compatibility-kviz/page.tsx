import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { Kviz } from "~/app/_components/Kviz";
import { getServerAuthSession } from "~/server/auth";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card } from "~/components/ui/card";
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
      <Card className="w-full gap-6 p-4">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        {session ? <Kviz /> : <div className="text-center">{t("loginRequired")}</div>}
      </Card>
    </HydrateClient>
  );
}
