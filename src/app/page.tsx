import { HydrateClient } from "~/trpc/server";
import { Feed } from "./_components/Feed";
import { ProfileCompleteness } from "./_components/ProfileCompleteness";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  return (
    <HydrateClient>
      {session && <ProfileCompleteness compact />}
      <Feed userId={session?.user.id} />
    </HydrateClient>
  );
}
