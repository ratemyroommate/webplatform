import { HydrateClient } from "~/trpc/server";
import { Kviz } from "../_components/Kviz";
import { getServerAuthSession } from "~/server/auth";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const session = await getServerAuthSession();
  const t = await getTranslations("kviz");
  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 shadow-xl">
        {session ? <Kviz /> : <div className="text-center">{t("loginRequired")}</div>}
      </div>
    </HydrateClient>
  );
}
