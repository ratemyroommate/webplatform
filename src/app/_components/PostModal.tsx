"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Post } from "@prisma/client";
import { LoginModal, handleCloseModal, handleOpenModal } from "./LoginModal";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { isUserInPostGroup } from "~/utils/helpers";
import { genUploader } from "uploadthing/client";
import { ChangeEvent } from "react";
import { compressImages } from "~/utils/imagecompression";

export const { uploadFiles } = genUploader({ package: "uploadthing/client" });

type PostModalProps = {
  post?: PostExtended;
  userId?: string;
};

type FormValues = Omit<
  Post,
  "id" | "createdAt" | "updatedAt" | "createdById" | "images"
> & { isResident: boolean; images: File[] };

const defaultValues = {
  description: "",
  maxPersonCount: 2,
  isResident: true,
  images: [],
};
const maxPersonCount = { min: 2, max: 6 };

export const PostModal = ({ post, userId }: PostModalProps) => {
  const {
    watch,
    reset,
    control,
    register,
    setError,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: post
      ? {
          images: [],
          description: post.description,
          maxPersonCount: post.maxPersonCount,
          isResident: !!userId && isUserInPostGroup(post, userId),
        }
      : defaultValues,
  });

  const router = useRouter();
  const modalId = userId
    ? post
      ? `post-modal-${post.id}`
      : "post-modal"
    : "login-modal";
  const successMessage = `Post sikeresen ${post ? "módosítva" : "létrehozva"}`;
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      handleCloseModal(modalId);
      toast.success(successMessage);
      reset();
    },
    onError: (error) => {
      handleCloseModal(modalId);
      toast.error(error.message);
    },
  });
  const updatePost = api.post.update.useMutation({
    onSuccess: () => {
      router.refresh();
      handleCloseModal(modalId);
      toast.success(successMessage);
    },
  });

  const handleDecrease = () => {
    const currentValue = Number(getValues("maxPersonCount"));
    if (currentValue === maxPersonCount.min) return;
    setValue("maxPersonCount", currentValue - 1);
  };

  const handleIncrease = () => {
    const currentValue = Number(getValues("maxPersonCount"));
    if (currentValue === maxPersonCount.max) return;
    setValue("maxPersonCount", currentValue + 1);
  };

  const images = watch("images");

  const onSubmit = async (formValues: FormValues) => {
    const files = await compressImages(images);
    const response = await uploadFiles("imageUploader", { files });
    const imageInfos = response.map(({ key, url }) => ({
      id: key,
      url,
    }));
    post
      ? updatePost.mutate({ ...formValues, images: imageInfos, id: post.id })
      : createPost.mutate({ ...formValues, images: imageInfos });
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) return;
    const areFilesValid = files?.length <= 4;
    setValue("images", areFilesValid ? Array.from(files) : []);
    setError("images", {
      message: areFilesValid ? "" : "Maximum 4 képet lehet feltölteni jelenleg",
    });
  };

  const previewImages = images.length
    ? images.map((image) => URL.createObjectURL(image))
    : post
      ? post.images.map(({ url }) => url)
      : [];

  return (
    <>
      <button
        onClick={() => handleOpenModal(modalId)}
        className={`btn ${!post && "btn-secondary w-full shadow-xl"}`}
      >
        {post ? (
          <>
            <PencilSquareIcon width={20} />
            Módosítás
          </>
        ) : (
          <>
            <PlusIcon width={20} />
            Új post
          </>
        )}
      </button>
      <LoginModal />
      <dialog
        id={post ? `post-modal-${post.id}` : "post-modal"}
        className="modal"
      >
        <div className="modal-box max-w-5xl">
          <h3 className="text-lg font-bold">{`Poszt ${post ? "módosítás" : "létrehozás"}`}</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              ✕
            </button>
          </form>
          <form
            className="flex w-full flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            <LoginModal />
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">Képek a lakásról</span>
              </div>
              <Controller
                name="images"
                control={control}
                render={() => (
                  <input
                    max={4}
                    multiple
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleImagesChange}
                    className="file-input file-input-bordered w-full max-w-xs"
                  />
                )}
              />
              {errors.images && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.images.message}
                  </span>
                </div>
              )}
              {!!previewImages.length && (
                <div className="carousel carousel-center max-w-md space-x-4 rounded-box p-4">
                  {previewImages.map((image, index) => (
                    <div key={index} className="carousel-item">
                      <img src={image} className="h-36 rounded-box" />
                    </div>
                  ))}
                </div>
              )}
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">Leírás</span>
              </div>
              <textarea
                placeholder="Keresünk egy hozzánk hasonló..."
                className="textarea textarea-bordered textarea-lg w-full"
                {...register("description", { required: "A leírás kötelező" })}
              ></textarea>
              {errors.description && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.description.message}
                  </span>
                </div>
              )}
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">Személyek száma</span>
              </div>
              <div className="flex gap-4">
                <button
                  className="btn btn-square md:btn-wide"
                  onClick={handleDecrease}
                  type="button"
                >
                  <MinusIcon width={20} />
                </button>
                <input
                  min={2}
                  max={6}
                  type="number"
                  className="input input-bordered w-full"
                  {...register("maxPersonCount", { min: 2, max: 6 })}
                />
                <button
                  className="btn btn-square md:btn-wide"
                  onClick={handleIncrease}
                  type="button"
                >
                  <PlusIcon width={20} />
                </button>
              </div>
            </label>
            <div className="form-control py-2">
              <label className="label cursor-pointer justify-start gap-4">
                <span className="label-text text-lg">Én is lakó vagyok</span>
                <input
                  type="checkbox"
                  {...register("isResident")}
                  className="checkbox"
                />
              </label>
            </div>
            <button
              disabled={isSubmitting || createPost.isPending}
              className="btn btn-secondary btn-wide mt-4 self-center"
            >
              Közzététel
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
