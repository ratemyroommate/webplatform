"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { handleCloseModal, handleOpenModal } from "./LoginModal";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import { XButton } from "./CloseButton";
import { useTranslations } from "next-intl";

type FormValues = { about: string | null; socialLink: string | null };

export const EditProfile = (user: User) => {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { about: user.about, socialLink: user.socialLink },
  });

  const router = useRouter();
  const utils = api.useUtils();
  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      router.refresh();
      handleCloseModal("edit-profile-modal");
      toast.success(t("updateSuccess"));
      void utils.user.getProfileCompleteness.invalidate();
    },
  });

  const onSubmit = (formValues: FormValues) =>
    updateUser.mutate({
      id: user.id,
      about: formValues.about?.trim() ? formValues.about.trim() : null,
      socialLink: formValues.socialLink?.trim() ? formValues.socialLink.trim() : null,
    });

  return (
    <div>
      <button onClick={() => handleOpenModal("edit-profile-modal")} className="btn">
        <PencilSquareIcon width={20} />
        {t("editProfile")}
      </button>
      <dialog id="edit-profile-modal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t("editProfile")}</h3>
          <XButton />
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 pt-4">
            <label className="form-control flex w-full flex-col">
              <div className="label">
                <span className="label-text text-lg">{t("socialLink")}</span>
              </div>
              <input
                className="input input-bordered w-full"
                placeholder={t("socialLinkPlaceholder")}
                {...register("socialLink", {
                  required: tc("required"),
                  validate: (value) =>
                    !value || /^https?:\/\/.+/.test(value.trim()) || t("socialLinkInvalid"),
                })}
              />
              {formState.errors.socialLink && (
                <div className="label">
                  <span className="label-text-alt text-orange-600">
                    {formState.errors.socialLink?.message}
                  </span>
                </div>
              )}
            </label>
            <label className="form-control flex w-full flex-col">
              <div className="label">
                <span className="label-text text-lg">{t("about")}</span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder={t("aboutPlaceholder")}
                {...register("about", {
                  required: tc("required"),
                })}
              />
              {formState.errors.about && (
                <div className="label">
                  <span className="label-text-alt text-orange-600">
                    {formState.errors.about?.message}
                  </span>
                </div>
              )}
            </label>
            <button
              disabled={formState.isSubmitting || updateUser.isPending}
              className="btn btn-secondary"
            >
              {tc("save")}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
};
