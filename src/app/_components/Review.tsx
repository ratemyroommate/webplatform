"use client";

import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Rating } from "./Rating";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { LoginModal, handleCloseModal, handleOpenModal } from "./LoginModal";

type ReviewProps = { edit?: boolean; reviewedId: string; reviewerId?: string };
type FormValues = { rating: number; comment: string };

export const Review = ({ edit, reviewedId, reviewerId }: ReviewProps) => {
  const { register, reset, getValues, setValue, handleSubmit, formState } =
    useForm<FormValues>({
      defaultValues: { rating: 5, comment: "" },
    });

  const router = useRouter();
  const modalId = reviewerId ? "review-modal" : "login-modal";
  const createReview = api.review.create.useMutation({
    onSuccess: () => {
      router.refresh();
      handleCloseModal(modalId);
      reset();
    },
  });

  const onSubmit = (formValues: FormValues) =>
    createReview.mutate({ ...formValues, reviewedId });
  const handleRatingClick = (rating: number) => setValue("rating", rating);

  return (
    <>
      <button
        className="btn btn-secondary w-full shadow-xl"
        onClick={() => handleOpenModal(modalId)}
      >
        {edit ? (
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
      <dialog id="review-modal" className="modal">
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
              rating={getValues("rating")}
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
              disabled={formState.isSubmitting || createReview.isPending}
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
