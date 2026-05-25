import { type Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrateClient, api } from "~/trpc/server";
import { Feed } from "~/app/_components/Feed";
import { CompactProfileCompleteness } from "~/app/_components/ProfileCompleteness";
import { getServerAuthSession } from "~/server/auth";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("home.title"),
    description: t("home.description"),
  };
}

export default async function Home({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const session = await getServerAuthSession();
  const tMeta = await getTranslations("metadata");

  await api.post.getFresh.prefetch();

  return (
    <HydrateClient>
      <h1 className="sr-only">{tMeta("home.title")}</h1>
      {session && <CompactProfileCompleteness />}
      <Feed userId={session?.user.id} />
    </HydrateClient>
  );
}
