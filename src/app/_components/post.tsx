import { Post as TPost } from "@prisma/client";
import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";

export const Post = async (post: TPost) => {
  return (
    <div className="card bg-base-100 flex w-full flex-col items-center justify-between gap-6 p-8 shadow-xl sm:flex-row">
      <div className="skeleton h-48 w-48 min-w-48"></div>
      <div className="flex flex-col gap-6">
        <FeaturedUsers {...post} />
        <p className="line-clamp-3 overflow-hidden text-ellipsis">
          {post.description}
        </p>
      </div>
      <Link href={`/posts/${post.id}`} className="btn btn-primary">
        Megtekintés
      </Link>
    </div>
  );
};
