import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { Kviz } from "../_components/Kviz";
import { getServerAuthSession } from "~/server/auth";
import { getTranslations } from "next-intl/server";
import { Card } from "~/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("kviz.title"),
    description: t("kviz.description"),
  };
}

export default async function Page() {
  const session = await getServerAuthSession();
  const t = await getTranslations("kviz");
  return (
    <HydrateClient>
      <Card className="w-full gap-6 p-4">
        {session ? <Kviz /> : <div className="text-center">{t("loginRequired")}</div>}
      </Card>
    </HydrateClient>
  );
}
