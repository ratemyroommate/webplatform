import { type Metadata } from "next";
import { Mail } from "lucide-react";
import { HydrateClient } from "~/trpc/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { alternatesFor } from "~/i18n/seo";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("contact.title"),
    description: t("contact.description"),
    alternates: alternatesFor(locale, "/contact"),
  };
}

export default async function Contact({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  return (
    <HydrateClient>
      <Card className="w-full gap-6 p-6 py-10">
        <h1 className="text-2xl">{t("title")}</h1>
        <p dangerouslySetInnerHTML={{ __html: t.raw("body") as string }} />
        <Button asChild size="lg" className="self-start">
          <a href="mailto:rmrm.owners@gmail.com">
            {t("sendEmail")}
            <Mail />
          </a>
        </Button>
      </Card>
    </HydrateClient>
  );
}
