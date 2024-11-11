import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Rating } from "~/app/_components/Rating";
import { Review } from "~/app/_components/Review";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

type UserPageProps = { params: { id: string } };

export default async function User({ params: { id } }: UserPageProps) {
  const session = await getServerAuthSession();
  const user = await api.user.getById(id);

  if (!user) return "User not found";

  const canReview = user.reviewsReceived.some(
    (review) => review.reviewer.id === session?.user.id,
  );
  const averageRating = user.reviewsReceived.length
    ? user.reviewsReceived.reduce((sum, { rating }) => sum + rating, 0) /
      user.reviewsReceived.length
    : 0;

  return (
    <>
      <div className="card bg-base-100 flex w-full flex-col gap-8 p-8 shadow-xl">
        <img className="w-20 rounded-2xl" src={user.image ?? ""} />
        <div className="flex flex-col gap-2">
          <b>{user.name}</b>
          <div className="flex items-center gap-2">
            <Rating
              itemKey={Infinity}
              rating={averageRating}
              readOnly={true}
              size="lg"
            />
            <span>( {user.reviewsReceived.length} )</span>
          </div>
          {user.socialLink && (
            <div className="flex items-center gap-2">
              <DocumentMagnifyingGlassIcon width={40} />
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
      {canReview && <Review reviewedId={id} reviewerId={session?.user.id} />}
      {user.reviewsReceived.length
        ? user.reviewsReceived.map((review, index) => (
            <div className="card bg-base-100 flex w-full flex-col gap-4 p-8 shadow-xl">
              <div className="flex gap-6">
                <img
                  className="w-12 rounded-full"
                  src={review.reviewer.image ?? ""}
                />
                <span className="text-sm">{review.reviewer.name}</span>
              </div>
              <Rating rating={review.rating} itemKey={index} />
              <p>{review.comment || "Nincs megjegyzés"}</p>
            </div>
          ))
        : "Nincs értékelés"}
    </>
  );
}
