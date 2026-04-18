import { HydrateClient } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { CompletedKviz } from "~/app/_components/CompletedKviz";
import { getTranslations } from "next-intl/server";

type KvizPageProps = { params: { id: string } };

export default async function Page({ params: { id } }: KvizPageProps) {
  const session = await getServerAuthSession();
  const t = await getTranslations("kviz");
  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 shadow-xl">
        {session ? (
          <CompletedKviz userId={id} />
        ) : (
          <div className="text-center">{t("loginRequiredAnswers")}</div>
        )}
      </div>
    </HydrateClient>
  );
}
