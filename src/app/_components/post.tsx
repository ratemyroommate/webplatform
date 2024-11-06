import { Post as TPost } from "@prisma/client";
import Link from "next/link";
import { Rating } from "./Rating";

const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/020/765/399/large_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

export const Post = async (
  post: TPost & {
    featuredUsers: { image: string | null; name: string | null }[];
  },
) => {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="card bg-base-100 flex w-full flex-col items-center justify-between gap-6 p-8 shadow-xl sm:flex-row"
    >
      <div className="skeleton h-48 w-48 min-w-48"></div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-center gap-2 gap-y-4">
          {Array.from({ length: post.maxPersonCount }).map((_, index) => (
            <div className="flex flex-col items-center gap-2" key={index}>
              <div className="avatar w-10" key={index}>
                <div className="ring-secondary ring-offset-base-100 rounded-full ring ring-offset-2">
                  <img
                    src={post.featuredUsers?.[index]?.image ?? defaultImage}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs">
                  {post.featuredUsers?.[index]?.name ?? "\u200B"}
                </p>
                <Rating rating={3} itemKey={index} readOnly />
              </div>
            </div>
          ))}
        </div>
        <p className="line-clamp-3 overflow-hidden text-ellipsis">
          {post.description}
        </p>
      </div>
      <button className="btn btn-primary">Megtekintés</button>
    </Link>
  );
};
