"use client";
import { Rating } from "./Rating";
import { getAverageRating } from "~/utils/helpers";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/020/765/399/large_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

type FeaturedUsersProps = PostExtended & { compact?: boolean };

export const FeaturedUsers = ({ compact, ...post }: FeaturedUsersProps) => {
  const router = useRouter();
  const t = useTranslations("featuredUsers");
  const emptySlots = post.maxPersonCount - post.featuredUsers.length;

  // ── Compact mode: overlapping avatar row + "+N" badge ──
  if (compact) {
    return (
      <div className="flex items-center">
        <div className="avatar-group -space-x-3">
          {post.featuredUsers.map((user, index) => (
            <div className="avatar w-8" key={index}>
              <div className="w-full rounded-full ring-2 ring-white">
                <Image
                  width={64}
                  height={64}
                  src={user.image ?? defaultImage}
                  alt={user.name ?? t("roommate")}
                />
              </div>
            </div>
          ))}
        </div>
        {emptySlots > 0 && (
          <span className="badge badge-outline badge-sm ml-2 font-medium">
            {t("freeSlots", { count: emptySlots })}
          </span>
        )}
      </div>
    );
  }

  // ── Full mode: expanded avatars with names & ratings ──
  return (
    <div className="flex flex-wrap items-center gap-3 gap-y-4">
      {Array.from({ length: post.maxPersonCount }).map((_, index) => (
        <div
          onClick={(e) => {
            e.preventDefault();
            router.push(
              post.featuredUsers[index]?.id ? `/users/${post.featuredUsers[index]?.id}` : "#"
            );
          }}
          className="flex cursor-pointer flex-col items-center gap-2 transition-transform hover:scale-105"
          key={index}
        >
          <div className="avatar w-12">
            <div className="ring-primary ring-offset-base-100 w-full rounded-full shadow-md ring-2 ring-offset-2">
              <Image
                width={100}
                height={100}
                src={post.featuredUsers?.[index]?.image ?? defaultImage}
                alt={t("roommate")}
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="max-w-[80px] truncate text-xs font-medium">
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
