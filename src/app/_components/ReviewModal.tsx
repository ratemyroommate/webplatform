"use client";

import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Rating } from "./Rating";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { LoginModal, handleCloseModal, handleOpenModal } from "./LoginModal";
import { Review } from "@prisma/client";
import { toast } from "react-hot-toast";

type ReviewProps = {
  review?: Review;
  reviewedId: string;
  reviewerId?: string;
};
type FormValues = { rating: number; comment: string | null };

export const ReviewModal = ({
  review,
  reviewedId,
  reviewerId,
}: ReviewProps) => {
  const { register, watch, setValue, handleSubmit, formState } =
    useForm<FormValues>({
      defaultValues: review
        ? { rating: review.rating, comment: review.comment }
        : { rating: 5, comment: "" },
    });

  const router = useRouter();
  const modalId = reviewerId
    ? review
      ? `review-modal-${review.id}`
      : "review-modal"
    : "login-modal";
  const successMessage = `Értékelés sikeresen ${review ? "módosítva" : "létrehozva"}`;
  const reviewMutation = api.review[review ? "update" : "create"].useMutation({
    onSuccess: () => {
      router.refresh();
      handleCloseModal(modalId);
      toast.success(successMessage);
    },
  });

  const onSubmit = (formValues: FormValues) =>
    reviewMutation.mutate({ ...formValues, reviewedId });
  const handleRatingClick = (rating: number) => setValue("rating", rating);

  return (
    <>
      <button
        className={`btn ${!review && "btn-secondary w-full shadow-xl"}`}
        onClick={() => handleOpenModal(modalId)}
      >
        {review ? (
          <>
            <PencilSquareIcon width={20} />
            Módosítás
          </>
        ) : (
          <>
            <PlusIcon width={20} />
            Új értékelés
          </>
        )}
      </button>
      <LoginModal />
      <dialog
        id={review ? `review-modal-${review.id}` : "review-modal"}
        className="modal"
      >
        <div className="modal-box">
          <h3 className="text-lg font-bold">Adj egy értékelést</h3>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 pt-8"
          >
            <Rating
              rating={watch("rating")}
              itemKey={-1}
              size={"lg"}
              onClick={handleRatingClick}
            />
            <textarea
              className="textarea textarea-bordered"
              placeholder="Írd le a véleményed"
              {...register("comment")}
            />
            <button
              disabled={formState.isSubmitting || reviewMutation.isPending}
              className="btn btn-secondary"
            >
              Közzététel
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
