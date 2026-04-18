import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { getTranslations } from "next-intl/server";

export default async function Contact() {
  const t = await getTranslations("contact");
  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 py-10 shadow-xl">
        <h1 className="text-2xl">{t("title")}</h1>
        <p dangerouslySetInnerHTML={{ __html: t.raw("body") as string }} />
        <Link href="mailto:rmrm.owners@gmail.com" className="btn btn-lg btn-secondary">
          {t("sendEmail")}
          <EnvelopeIcon width={20} />
        </Link>
      </div>
    </HydrateClient>
  );
}
