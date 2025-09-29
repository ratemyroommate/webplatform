import { HydrateClient } from "~/trpc/server";
import { Kviz } from "../_components/Kviz";
import { getServerAuthSession } from "~/server/auth";

export default async function Page() {
  const session = await getServerAuthSession();
  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 shadow-xl">
        {session ? (
          <Kviz />
        ) : (
          <div className="text-center">Jelentkezz be, hogy lásd a kvízt</div>
        )}
      </div>
    </HydrateClient>
  );
}
