"use client";

import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { LoginModal, handleCloseModal, handleOpenModal } from "./LoginModal";
import { toast } from "react-hot-toast";
import { XButton } from "./CloseButton";

import { useTranslations } from "next-intl";

type ReviewProps = { postId: number; userId?: string };
type FormValues = { comment: string | null };

export const RequestModal = ({ postId, userId }: ReviewProps) => {
  const t = useTranslations("request");
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { comment: "" },
  });

  const router = useRouter();
  const modalId = userId ? "request-modal" : "login-modal";
  const reviewMutation = api.request.create.useMutation({
    onSuccess: () => {
      router.refresh();
      handleCloseModal(modalId);
      toast.success(t("success"));
    },
  });

  const onSubmit = (formValues: FormValues) => reviewMutation.mutate({ ...formValues, postId });

  return (
    <>
      <button
        className="btn btn-secondary w-full shadow-xl"
        onClick={() => handleOpenModal(modalId)}
      >
        <UserGroupIcon width={20} />
        {t("apply")}
      </button>
      <LoginModal />
      <dialog id={"request-modal"} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t("title")}</h3>
          <XButton />
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 pt-8">
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder={t("commentPlaceholder")}
              {...register("comment")}
            />
            <button
              disabled={formState.isSubmitting || reviewMutation.isPending}
              className="btn btn-secondary"
            >
              {t("send")}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
