import { type Metadata } from "next";
import { Mail } from "lucide-react";
import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { getTranslations } from "next-intl/server";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("contact.title"),
    description: t("contact.description"),
  };
}

export default async function Contact() {
  const t = await getTranslations("contact");
  return (
    <HydrateClient>
      <Card className="w-full gap-6 p-6 py-10">
        <h1 className="text-2xl">{t("title")}</h1>
        <p dangerouslySetInnerHTML={{ __html: t.raw("body") as string }} />
        <Button asChild size="lg" className="self-start">
          <Link href="mailto:rmrm.owners@gmail.com">
            {t("sendEmail")}
            <Mail />
          </Link>
        </Button>
      </Card>
    </HydrateClient>
  );
}
