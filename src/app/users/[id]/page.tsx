import { type Metadata } from "next";
import { FileSearch, Phone } from "lucide-react";
import Link from "next/link";
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

type UserPageProps = { params: { id: string } };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("user.title"),
    description: t("user.description"),
  };
}

export default async function User({ params: { id } }: UserPageProps) {
  const session = await getServerAuthSession();
  const user = await api.user.getById(id);
  const t = await getTranslations("profile");

  if (!user) return t("userNotFound");

  const canEdit = id === session?.user.id;
  const canReview =
    !canEdit && user.reviewsReceived.every((review) => review.reviewer.id !== session?.user.id);

  return (
    <HydrateClient>
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
          <b>{user.name}</b>
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
