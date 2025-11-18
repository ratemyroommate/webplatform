import { HydrateClient } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { CompletedKviz } from "~/app/_components/CompletedKviz";

type KvizPageProps = { params: { id: string } };

export default async function Page({ params: { id } }: KvizPageProps) {
  const session = await getServerAuthSession();
  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 shadow-xl">
        {session ? (
          <CompletedKviz userId={id} />
        ) : (
          <div className="text-center">
            Jelentkezz be, hogy lásd a kvíz válaszokat
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
