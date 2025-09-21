import { HydrateClient } from "~/trpc/server";
import { Kviz } from "../_components/Kviz";

export default async function Page() {
  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 shadow-xl">
        <Kviz />
      </div>
    </HydrateClient>
  );
}
