import { type Metadata } from "next";
import { FileSearch, Phone, Star } from "lucide-react";
import { Link } from "~/i18n/navigation";
import Image from "next/image";
import { EditProfile } from "~/app/_components/EditProfile";
import { Post } from "~/app/_components/post";
import { ProfileCompleteness } from "~/app/_components/ProfileCompleteness";
import { QuizCard } from "~/app/_components/QuizCard";
import { Rating } from "~/app/_components/Rating";
import { ReviewModal } from "~/app/_components/ReviewModal";
import { ShareModal } from "~/app/_components/ShareModal";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { getAverageRating } from "~/utils/helpers";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { BackToFeed } from "~/components/ui/back-to-feed";
import { JsonLd } from "~/app/_components/JsonLd";
import { Card } from "~/components/ui/card";
import { ProfileCover } from "~/components/ui/profile-cover";
import { alternatesFor, getBaseUrl } from "~/i18n/seo";

type UserPageProps = { params: { id: string; locale: string } };

export async function generateMetadata({
  params: { id, locale },
}: UserPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const user = await api.user.getById(id);
  if (!user) return { title: t("user.title") };

  const name = user.name?.trim() ?? "";
  const title = name ? t("user.titleWithName", { name }) : t("user.title");
  const description = user.about?.trim().length ? user.about.slice(0, 200) : t("user.description");
  const alts = alternatesFor(locale, `/users/${id}`);

  return {
    title,
    description,
    alternates: alts,
    openGraph: {
      type: "profile",
      url: alts.canonical,
      title,
      description,
      images: user.image ? [{ url: user.image, alt: name || title }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: user.image ? [user.image] : undefined,
    },
  };
}

export default async function User({ params: { id, locale } }: UserPageProps) {
  setRequestLocale(locale);
  const session = await getServerAuthSession();
  const user = await api.user.getById(id);
  const format = await getFormatter();
  const t = await getTranslations("profile");

  if (!user) return t("userNotFound");

  const canEdit = id === session?.user.id;
  const canReview =
    !canEdit && user.reviewsReceived.every((review) => review.reviewer.id !== session?.user.id);

  const userPosts = await api.post.getAllByUserId(id);

  const baseUrl = getBaseUrl();
  const ratingValue = getAverageRating(user);
  const reviewCount = user.reviewsReceived.length;
  const displayRating = reviewCount > 0 ? ratingValue : 0;
  const personLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name ?? undefined,
    description: user.about ?? undefined,
    image: user.image ?? undefined,
    url: `${baseUrl}/users/${id}`,
    sameAs: user.socialLink ? [user.socialLink] : undefined,
    aggregateRating:
      reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: user.reviewsReceived.map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: review.reviewer.name ?? undefined },
      reviewBody: review.comment ?? undefined,
    })),
  };

  return (
    <HydrateClient>
      <JsonLd data={personLd} />

      <div className="mx-auto flex w-full max-w-[1100px] flex-col">
        <div className="mb-4 flex items-center justify-between">
          <BackToFeed />
          <div className="flex items-center gap-2">
            <ShareModal
              url={`${baseUrl}/users/${id}`}
              title={user.name ?? undefined}
              titleKey="titleProfile"
              subtitleKey="subtitleProfile"
            />
            {canEdit && <EditProfile {...user} />}
          </div>
        </div>

        {/* Profile header card */}
        <Card className="w-full gap-0 overflow-hidden rounded-3xl p-0">
          <ProfileCover />

          <div className="px-6 pt-0 pb-6 sm:px-8">
            <div className="-mt-12 flex items-end justify-between gap-4">
              <div className="ring-background relative z-10 size-[104px] overflow-hidden rounded-full ring-4">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={t("userProfileImage")}
                    width={104}
                    height={104}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center text-3xl font-bold">
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end pb-2 text-right">
                <div className="flex items-center gap-1.5">
                  <ProfileStars value={displayRating} />
                  <span className="text-[12px] text-[color:var(--ink-60)] tabular-nums">
                    ({reviewCount})
                  </span>
                </div>
                {reviewCount === 0 && (
                  <div className="text-[11px] text-[color:var(--ink-50)]">{t("noRating")}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h1
                className="text-foreground font-extrabold tracking-[-0.02em]"
                style={{ fontSize: 40, lineHeight: 1.05 }}
              >
                {user.name}
              </h1>

              {(user.socialLink ?? user.phoneNumber) && (
                <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px]">
                  {user.socialLink && (
                    <Link
                      href={user.socialLink}
                      className="hover:text-primary inline-flex items-center gap-1.5"
                    >
                      <FileSearch size={13} strokeWidth={1.75} />
                      <span className="line-clamp-1 max-w-[260px]">{user.socialLink}</span>
                    </Link>
                  )}
                  {user.phoneNumber && (
                    <a
                      href={`tel:${user.phoneNumber}`}
                      className="hover:text-primary inline-flex items-center gap-1.5"
                    >
                      <Phone size={13} strokeWidth={1.75} />
                      {user.phoneNumber}
                    </a>
                  )}
                </div>
              )}

              {user.about && (
                <p className="mt-5 max-w-[640px] text-[14.5px] leading-[1.7] text-[color:var(--ink-80)]">
                  {user.about}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Completeness + Quiz cards (owner only) */}
        {canEdit && (
          <div className="mt-6 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7">
              <ProfileCompleteness user={user} />
            </div>
            <div className="col-span-12 md:col-span-5">
              <QuizCard />
            </div>
          </div>
        )}

        {/* Posts */}
        <section className="mt-10">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2
              className="text-foreground font-extrabold tracking-[-0.01em]"
              style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}
            >
              {canEdit ? t("myPostsHeading") : t("postsHeading")}
            </h2>
          </div>
          {userPosts.length ? (
            <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
              {userPosts.map((post) => (
                <Post post={post} key={post.id} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-[13px]">
              {canEdit ? t("noPosts") : t("noPostsOther")}
            </p>
          )}
        </section>

        {/* Reviews */}
        <div className="mt-10 flex w-full flex-col gap-4">
          {canReview && <ReviewModal reviewedId={id} reviewerId={session?.user.id} />}
          {user.reviewsReceived.length ? (
            user.reviewsReceived.map((review, index) => (
              <Card key={index} className="w-full gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/users/${review.reviewer.id}`} className="flex items-center gap-3">
                    <Avatar className="size-10">
                      {review.reviewer.image && (
                        <AvatarImage src={review.reviewer.image} alt={t("userProfileImage")} />
                      )}
                      <AvatarFallback>
                        {review.reviewer.name?.charAt(0).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-foreground text-[13.5px] font-semibold">
                        {review.reviewer.name}
                      </span>
                      <span className="text-muted-foreground text-[11.5px]">
                        {format.dateTime(review.createdAt, { month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </Link>
                  {review.reviewer.id === session?.user.id && (
                    <ReviewModal reviewerId={session?.user.id} reviewedId={id} review={review} />
                  )}
                </div>
                <Rating rating={review.rating} itemKey={index} />
                <p className="text-muted-foreground text-[13.5px] leading-[1.6]">
                  {review.comment ?? t("noReviewComment")}
                </p>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center text-[13px]">{t("noReviews")}</p>
          )}
        </div>
      </div>
    </HydrateClient>
  );
}

function ProfileStars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={1.5}
          className={
            i < full
              ? "fill-[var(--star-hex)] stroke-[var(--star-hex)]"
              : "fill-transparent stroke-[color:var(--ink-60)]"
          }
        />
      ))}
    </span>
  );
}
