import Link from "next/link";
import { Rating } from "./Rating";
import { getAverageRating } from "~/utils/helpers";

const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/020/765/399/large_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

export const FeaturedUsers = (post: PostExtended) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 gap-y-4">
      {Array.from({ length: post.maxPersonCount }).map((_, index) => (
        <Link
          href={
            post.featuredUsers[index]?.id
              ? `/users/${post.featuredUsers[index]?.id}`
              : "#"
          }
          className="flex flex-col items-center gap-2"
          key={index}
        >
          <div className="avatar w-10" key={index}>
            <div className="rounded-full ring ring-secondary ring-offset-2 ring-offset-base-100">
              <img
                src={post.featuredUsers?.[index]?.image ?? defaultImage}
                alt="szobatárs"
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs">
              {post.featuredUsers[index]?.name ?? "\u200B"}
            </p>
            <Rating
              rating={getAverageRating(post.featuredUsers[index])}
              itemKey={`${post.id}-${index}`}
              readOnly
            />
          </div>
        </Link>
      ))}
    </div>
  );
};
