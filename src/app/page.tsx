import { HydrateClient } from "~/trpc/server";
import { Feed } from "./_components/Feed";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  return (
    <HydrateClient>
      <Feed userId={session?.user.id} />
    </HydrateClient>
  );
}
