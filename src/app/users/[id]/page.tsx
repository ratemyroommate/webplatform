import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Rating } from "~/app/_components/Rating";
import { api } from "~/trpc/server";

type UserPageProps = { params: { id: string } };

export default async function User({ params: { id } }: UserPageProps) {
  const user = await api.user.getById(id);

  if (!user) return "User not found";

  return (
    <div className="card bg-base-100 flex w-full flex-col gap-8 p-8 shadow-xl">
      <img className="w-20 rounded-2xl" src={user.image ?? ""} />
      <div className="flex flex-col gap-2">
        <b>{user.name}</b>
        <Rating itemKey={1} rating={3} />
        {user.socialLink && (
          <div className="flex items-center gap-2">
            <DocumentMagnifyingGlassIcon width={40} />
            <Link
              href={user.socialLink ?? "#"}
              className="link link-primary line-clamp-1 overflow-hidden"
            >
              {user.socialLink}
            </Link>
          </div>
        )}
      </div>
      <p>{user.about}</p>
    </div>
  );
}
