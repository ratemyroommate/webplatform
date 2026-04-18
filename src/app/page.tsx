import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HydrateClient } from "~/trpc/server";
import { Feed } from "./_components/Feed";
import { ProfileCompleteness } from "./_components/ProfileCompleteness";
import { getServerAuthSession } from "~/server/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("home.title"),
    description: t("home.description"),
  };
}

export default async function Home() {
  const session = await getServerAuthSession();
  return (
    <HydrateClient>
      {session && <ProfileCompleteness compact />}
      <Feed userId={session?.user.id} />
    </HydrateClient>
  );
}
