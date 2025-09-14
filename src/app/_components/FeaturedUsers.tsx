"use client";
import { Rating } from "./Rating";
import { getAverageRating } from "~/utils/helpers";
import Image from "next/image";
import { useRouter } from "next/navigation";

const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/020/765/399/large_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

export const FeaturedUsers = (post: PostExtended) => {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-2 gap-y-4">
      {Array.from({ length: post.maxPersonCount }).map((_, index) => (
        <div
          onClick={() =>
            router.push(
              post.featuredUsers[index]?.id
                ? `/users/${post.featuredUsers[index]?.id}`
                : "#",
            )
          }
          className="flex flex-col items-center gap-2"
          key={index}
        >
          <div className="avatar w-10" key={index}>
            <div className="ring-secondary ring-offset-base-100 w-full rounded-full ring-3 ring-offset-2">
              <Image
                width={100}
                height={100}
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
        </div>
      ))}
    </div>
  );
};
