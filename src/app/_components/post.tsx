import Image from "next/image";
import { Check, ImageIcon, Star } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { FreshBadge } from "~/components/ui/fresh-badge";
import { PriceChip } from "~/components/ui/price-chip";
import { getAverageRating } from "~/utils/helpers";

type PostProps = {
  post: PostExtended;
};

const FRESH_WINDOW_DAYS = 4;

export const Post = ({ post }: PostProps) => {
  const t = useTranslations("post");
  const te = useTranslations("enums.location");

  const cover = post.images[0]?.url;
  const locationLabel = te(post.location);
  const filled = post.featuredUsers.length;
  const total = post.maxPersonCount;
  const free = Math.max(0, total - filled);
  const isFresh = Date.now() - new Date(post.createdAt).getTime() < FRESH_WINDOW_DAYS * 86_400_000;

  const topRated = post.featuredUsers
    .map((u) => ({ ...u, rating: getAverageRating(u) }))
    .filter((u) => u.rating > 0)
    .sort((a, b) => b.rating - a.rating)[0];

  return (
    <Link href={`/posts/${post.id}`} className="group block w-full">
      {/* Image area */}
      <div
        className="bg-muted relative overflow-hidden rounded-[var(--radius)]"
        style={{ aspectRatio: "3 / 4" }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={t("coverAlt", { location: locationLabel, price: post.price, unit: t("priceShort") })}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon size={48} className="opacity-30" />
          </div>
        )}

        {isFresh && (
          <FreshBadge label={t("newBadge")} className="absolute left-3 top-3" />
        )}

        <PriceChip
          price={post.price}
          unit={t("priceShort")}
          className="absolute bottom-3 right-3"
        />
      </div>

      {/* Content row below image */}
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate text-[14.5px] font-bold leading-tight">
              {locationLabel}
            </div>
            {post.description && (
              <div className="text-muted-foreground mt-0.5 truncate text-[12.5px]">
                {post.description}
              </div>
            )}
          </div>
          {topRated && (
            <div className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[color:var(--ink-70)]">
              <Star size={11} className="fill-[var(--star-hex)] stroke-none" />
              <span className="tabular-nums">{topRated.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Roommate avatars + free spots line */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {post.featuredUsers.slice(0, 3).map((u) => (
              <Avatar
                key={u.id}
                className="ring-background size-6 ring-2"
                title={u.name ?? undefined}
              >
                {u.image && <AvatarImage src={u.image} alt="" />}
                <AvatarFallback className="text-[9px]">
                  {(u.name ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {free === 0 ? (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[color:var(--ink-10)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--ink-60)]">
              <Check size={11} strokeWidth={2.5} />
              {t("filled")}
            </span>
          ) : (
            <span className="text-muted-foreground whitespace-nowrap text-[12px]">
              <span className="text-foreground font-bold">{free}</span>
              <span> / {total}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
