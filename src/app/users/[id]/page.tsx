import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { EditProfile } from "~/app/_components/EditProfile";
import { Rating } from "~/app/_components/Rating";
import { ReviewModal } from "~/app/_components/ReviewModal";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getAverageRating } from "~/utils/helpers";

type UserPageProps = { params: { id: string } };

export default async function User({ params: { id } }: UserPageProps) {
  const session = await getServerAuthSession();
  const user = await api.user.getById(id);

  if (!user) return "User not found";

  const canEdit = id === session?.user.id;
  const canReview = user.reviewsReceived.every(
    (review) => review.reviewer.id !== session?.user.id,
  );

  return (
    <>
      <div className="card bg-base-100 flex w-full flex-col gap-8 p-6 shadow-xl">
        <div className="flex justify-between">
          <img className="w-20 rounded-2xl" src={user.image ?? ""} />
          {canEdit && <EditProfile {...user} />}
        </div>
        <div className="flex flex-col gap-2">
          <b>{user.name}</b>
          <div className="flex items-center gap-2">
            <Rating
              itemKey={Infinity}
              rating={getAverageRating(user)}
              readOnly={true}
              size="lg"
            />
            <span>( {user.reviewsReceived.length} )</span>
          </div>
          {user.socialLink && (
            <div className="flex items-center gap-2">
              <DocumentMagnifyingGlassIcon width={20} />
              <Link
                href={user.socialLink ?? "#"}
                className="link link-primary line-clamp-1 overflow-hidden"
              >
                {user.socialLink}
              </Link>
            </div>
          )}
        </div>
        <p>{user.about}</p>
      </div>
      {canReview && (
        <ReviewModal reviewedId={id} reviewerId={session?.user.id} />
      )}
      {user.reviewsReceived.length
        ? user.reviewsReceived.map((review, index) => (
            <div
              className="card bg-base-100 flex w-full flex-col gap-4 p-6 shadow-xl"
              key={index}
            >
              <div className="flex justify-between">
                <div className="flex gap-6">
                  <Link href={`/users/${review.reviewer.id}`}>
                    <img
                      className="w-12 rounded-full"
                      src={review.reviewer.image ?? ""}
                    />
                  </Link>
                  <span className="text-sm">{review.reviewer.name}</span>
                </div>
                {review.reviewer.id === session?.user.id && (
                  <ReviewModal
                    reviewerId={session?.user.id}
                    reviewedId={id}
                    review={review}
                  />
                )}
              </div>
              <Rating rating={review.rating} itemKey={index} />
              <p>{review.comment || "Nincs megjegyzés"}</p>
            </div>
          ))
        : "Nincs értékelés"}
    </>
  );
}
