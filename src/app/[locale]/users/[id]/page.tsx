import { type Metadata } from "next";
import { FileSearch, Phone } from "lucide-react";
import { Link } from "~/i18n/navigation";
import Image from "next/image";
import { EditProfile } from "~/app/_components/EditProfile";
import { Rating } from "~/app/_components/Rating";
import { ReviewModal } from "~/app/_components/ReviewModal";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { getAverageRating } from "~/utils/helpers";
import { ProfileCompleteness } from "~/app/_components/ProfileCompleteness";
import { getTranslations } from "next-intl/server";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { JsonLd } from "~/app/_components/JsonLd";
import { env } from "~/env";
import { alternatesFor } from "~/i18n/seo";
import { setRequestLocale } from "next-intl/server";

type UserPageProps = { params: { id: string; locale: string } };

export async function generateMetadata({
  params: { id, locale },
}: UserPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const user = await api.user.getById(id);
  if (!user) return { title: t("user.title") };

  const name = user.name?.trim() ?? "";
  const title = name ? t("user.titleWithName", { name }) : t("user.title");
  const description = user.about?.trim().length
    ? user.about.slice(0, 200)
    : t("user.description");
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
  const t = await getTranslations("profile");

  if (!user) return t("userNotFound");

  const canEdit = id === session?.user.id;
  const canReview =
    !canEdit && user.reviewsReceived.every((review) => review.reviewer.id !== session?.user.id);

  const baseUrl = env.NEXTAUTH_URL.startsWith("http")
    ? env.NEXTAUTH_URL
    : `https://${env.NEXTAUTH_URL}`;
  const ratingValue = getAverageRating(user);
  const reviewCount = user.reviewsReceived.length;
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
      <Card className="w-full gap-6 p-6">
        <div className="flex justify-between">
          {user.image ? (
            <Image
              className="w-20 rounded-2xl"
              src={user.image}
              width={80}
              height={80}
              alt={t("userProfileImage")}
            />
          ) : (
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-semibold">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
          {canEdit && <EditProfile {...user} />}
        </div>
        {canEdit && <ProfileCompleteness />}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-2">
            <Rating itemKey={Infinity} rating={getAverageRating(user)} readOnly={true} isLarge />
            <span>( {user.reviewsReceived.length} )</span>
          </div>
          {user.socialLink && (
            <div className="flex items-center gap-2">
              <FileSearch size={20} />
              <Link
                href={user.socialLink ?? "#"}
                className="text-primary line-clamp-1 overflow-hidden hover:underline"
              >
                {user.socialLink}
              </Link>
            </div>
          )}
          {user.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone size={20} />
              <a href={`tel:${user.phoneNumber}`} className="text-primary hover:underline">
                {user.phoneNumber}
              </a>
            </div>
          )}
        </div>
        <p>{user.about}</p>
      </Card>
      {canReview && <ReviewModal reviewedId={id} reviewerId={session?.user.id} />}
      {user.reviewsReceived.length
        ? user.reviewsReceived.map((review, index) => (
            <Card key={index} className="w-full gap-4 p-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <Link href={`/users/${review.reviewer.id}`}>
                    <Avatar className="size-12">
                      {review.reviewer.image && (
                        <AvatarImage src={review.reviewer.image} alt={t("userProfileImage")} />
                      )}
                      <AvatarFallback>
                        {review.reviewer.name?.charAt(0).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <span className="text-sm">{review.reviewer.name}</span>
                </div>
                {review.reviewer.id === session?.user.id && (
                  <ReviewModal reviewerId={session?.user.id} reviewedId={id} review={review} />
                )}
              </div>
              <Rating rating={review.rating} itemKey={index} />
              <p>{review.comment ?? t("noReviewComment")}</p>
            </Card>
          ))
        : t("noReviews")}
    </HydrateClient>
  );
}
