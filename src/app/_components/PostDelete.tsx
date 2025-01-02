"use client";

import { api } from "~/trpc/react";
import { handleCloseModal, handleOpenModal } from "./LoginModal";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

const modalId = "post-delete-modal";

type PostDeleteProps = { id: number };

export const PostDelete = ({ id }: PostDeleteProps) => {
  const router = useRouter();
  const deletePost = api.post.deleteById.useMutation({
    onSuccess: () => {
      handleCloseModal(modalId);
      router.push("/");
      toast.success("Poszt sikeresen törölve");
    },
    onError: (error) => {
      handleCloseModal(modalId);
      toast.error(error.message);
    },
  });

  return (
    <>
      <button
        onClick={() => handleOpenModal(modalId)}
        className="btn btn-error flex-1"
      >
        <TrashIcon width={20} />
        Törlés
      </button>
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="py-4 text-lg font-bold">
            Biztosan törölni szeretné a posztot?
          </h3>
          <div className="flex justify-between">
            <button onClick={() => handleCloseModal(modalId)} className="btn">
              Mégsem
            </button>
            <button
              onClick={() => deletePost.mutate(id)}
              className="btn btn-error"
            >
              Igen
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};
