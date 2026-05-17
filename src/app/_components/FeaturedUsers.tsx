"use client";
import { Rating } from "./Rating";
import { getAverageRating } from "~/utils/helpers";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

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
        <div className="flex -space-x-3">
          {post.featuredUsers.map((user, index) => (
            <Avatar key={index} className="ring-background size-8 ring-2">
              <AvatarImage src={user.image ?? defaultImage} alt={user.name ?? t("roommate")} />
              <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        {emptySlots > 0 && (
          <Badge variant="outline" className="ml-2 font-medium">
            {t("freeSlots", { count: emptySlots })}
          </Badge>
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
          <Avatar className="ring-primary ring-offset-background size-12 shadow-md ring-2 ring-offset-2">
            <AvatarImage
              src={post.featuredUsers?.[index]?.image ?? defaultImage}
              alt={t("roommate")}
            />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
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
