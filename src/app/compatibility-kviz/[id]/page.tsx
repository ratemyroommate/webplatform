import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { CompletedKviz } from "~/app/_components/CompletedKviz";
import { getTranslations } from "next-intl/server";
import { Card } from "~/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("kviz.title"),
    description: t("kviz.description"),
  };
}

type KvizPageProps = { params: { id: string } };

export default async function Page({ params: { id } }: KvizPageProps) {
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
