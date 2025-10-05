import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { HydrateClient } from "~/trpc/server";

export default async function Contact() {
  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 py-10 shadow-xl">
        <h1 className="text-2xl">Lépj velünk kapcsolatba</h1>
        <p>
          Elérhetőek vagyunk az <b>rmrm.owners@gmail.com</b> email címen.
          Örömmel fogadjuk a feedbacket, valamint bármilyen megkeresést.
        </p>
        <Link
          href="mailto:rmrm.owners@gmail.com"
          className="btn btn-lg btn-secondary"
        >
          Küldj emailt
          <EnvelopeIcon width={20} />
        </Link>
      </div>
    </HydrateClient>
  );
}
