"use client";

import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { LoginModal, handleCloseModal, handleOpenModal } from "./LoginModal";
import { toast } from "react-hot-toast";

const successMessage = `Kérés sikeresen elküldve`;

type ReviewProps = { postId: number; userId?: string };
type FormValues = { comment: string | null };

export const RequestModal = ({ postId, userId }: ReviewProps) => {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { comment: "" },
  });

  const router = useRouter();
  const modalId = userId ? "request-modal" : "login-modal";
  const reviewMutation = api.request.create.useMutation({
    onSuccess: () => {
      router.refresh();
      handleCloseModal(modalId);
      toast.success(successMessage);
    },
  });

  const onSubmit = (formValues: FormValues) =>
    reviewMutation.mutate({ ...formValues, postId });

  return (
    <>
      <button
        className="btn btn-secondary w-full shadow-xl"
        onClick={() => handleOpenModal(modalId)}
      >
        <UserGroupIcon width={20} />
        Jelentkezés
      </button>
      <LoginModal />
      <dialog id={"request-modal"} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Csatlakozás kérése</h3>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 pt-8"
          >
            <textarea
              className="textarea textarea-bordered"
              placeholder="Írd le a megjegyzésed"
              {...register("comment")}
            />
            <button
              disabled={formState.isSubmitting || reviewMutation.isPending}
              className="btn btn-secondary"
            >
              Küldés
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
