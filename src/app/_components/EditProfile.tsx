"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { handleCloseModal, handleOpenModal } from "./LoginModal";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

type FormValues = { about: string | null; socialLink: string | null };

export const EditProfile = (user: User) => {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { about: user.about, socialLink: user.socialLink },
  });

  const router = useRouter();
  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      router.refresh();
      handleCloseModal("edit-profile-modal");
      toast.success("Profil sikeresen frissítve");
    },
  });

  const onSubmit = (formValues: FormValues) =>
    updateUser.mutate({ id: user.id, ...formValues });

  return (
    <div>
      <button
        onClick={() => handleOpenModal("edit-profile-modal")}
        className="btn"
      >
        <PencilSquareIcon width={20} />
        Módosítás
      </button>
      <dialog id="edit-profile-modal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Profil módosítás</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              ✕
            </button>
          </form>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 pt-4"
          >
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">Social link</span>
              </div>
              <input
                className="input input-bordered"
                placeholder="https://facebook.com/..."
                {...register("socialLink")}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">Magadról</span>
              </div>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Írj magadról pár mondatot..."
                {...register("about", {
                  required: "Kötelező mező",
                })}
              />
              {formState.errors.about && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {formState.errors.about?.message}
                  </span>
                </div>
              )}
            </label>
            <button
              disabled={formState.isSubmitting || updateUser.isPending}
              className="btn btn-secondary"
            >
              Mentés
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
};
