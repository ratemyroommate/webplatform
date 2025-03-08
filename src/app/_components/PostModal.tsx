"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Post } from "@prisma/client";
import { LoginModal, handleCloseModal, handleOpenModal } from "./LoginModal";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
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
> & { isResident: boolean; images: File[]; removeImages: string[] };

const defaultValues = {
  description: "",
  maxPersonCount: 2,
  isResident: true,
  images: [],
  removeImages: [],
  price: 80,
};
const max = { maxPersonCount: 6, price: 999 };
const min = { maxPersonCount: 2, price: 10 };

export const PostModal = ({ post, userId }: PostModalProps) => {
  const {
    watch,
    reset,
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
          removeImages: [],
          price: post.price,
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

  const handleDecrease = (field: "maxPersonCount" | "price") => {
    const currentValue = getValues(field);
    if (currentValue === min[field]) return;
    setValue(field, currentValue - 1);
  };

  const handleIncrease = (field: "maxPersonCount" | "price") => {
    const currentValue = getValues(field);
    if (currentValue === max[field]) return;
    setValue(field, currentValue + 1);
  };

  const images = watch("images");
  const removeImages = watch("removeImages");

  const onSubmit = async (formValues: FormValues) => {
    const files = await compressImages(images);
    const response = await uploadFiles("imageUploader", { files });
    const imageInfos = response.map(({ key, url }) => ({
      id: key,
      url,
    }));
    if (post)
      updatePost.mutate({
        ...formValues,
        images: imageInfos,
        removeImages,
        id: post.id,
      });
    else createPost.mutate({ ...formValues, images: imageInfos });
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) return;
    const areFilesValid = files?.length <= 4;
    setValue(
      "images",
      areFilesValid ? [...getValues("images"), ...Array.from(files)] : [],
    );
    setError("images", {
      message: areFilesValid ? "" : "Maximum 4 képet lehet feltölteni jelenleg",
    });
  };

  const postImages = post ? post.images : [];
  const previewPostImages = postImages.filter(
    (image) => !removeImages.includes(image.id),
  );
  const newImages = images.map((image) => ({
    url: URL.createObjectURL(image),
  }));
  const previewImages = [...previewPostImages, ...newImages];

  const removeImage = (index: number) => {
    if (index < previewPostImages.length) {
      const removeImage = previewPostImages[index]?.id;
      if (!removeImage) return;
      return setValue("removeImages", [
        ...getValues("removeImages"),
        removeImage,
      ]);
    }

    setValue(
      "images",
      getValues("images").filter(
        (_, idx) => idx !== index - previewPostImages.length,
      ),
    );
  };

  return (
    <>
      <button
        onClick={() => handleOpenModal(modalId)}
        className={`btn flex-1 ${!post && "btn-secondary shadow-xl"}`}
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
            </label>

            <input
              name="images"
              max={4}
              multiple
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={handleImagesChange}
              className="file-input file-input-bordered w-full max-w-xs"
            />
            {errors.images && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {errors.images.message}
                </span>
              </div>
            )}
            {!!previewImages.length && (
              <div className="flex h-24 w-full gap-4 overflow-x-scroll py-2">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative h-auto flex-none">
                    <img
                      key={index}
                      src={image.url}
                      className="h-full rounded-lg"
                    />
                    <div
                      onClick={() => removeImage(index)}
                      className="absolute right-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-400"
                    >
                      ✕
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">Bérleti díj</span>
              </div>
              <div className="flex gap-4">
                <button
                  className="btn btn-square md:btn-wide"
                  onClick={() => handleDecrease("price")}
                  type="button"
                >
                  <MinusIcon width={20} />
                </button>

                <label className="input input-bordered flex w-full items-center justify-between gap-2">
                  <input
                    min={10}
                    max={999}
                    type="number"
                    {...register("price", {
                      valueAsNumber: true,
                      min: 10,
                      max: 999,
                    })}
                  />
                  <span>K ft/fő/hónap</span>
                </label>
                <button
                  className="btn btn-square md:btn-wide"
                  onClick={() => handleIncrease("price")}
                  type="button"
                >
                  <PlusIcon width={20} />
                </button>
              </div>
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
                  onClick={() => handleDecrease("maxPersonCount")}
                  type="button"
                >
                  <MinusIcon width={20} />
                </button>
                <label className="input input-bordered flex w-full items-center justify-between gap-2">
                  <input
                    min={2}
                    max={6}
                    type="number"
                    {...register("maxPersonCount", {
                      valueAsNumber: true,
                      min: 2,
                      max: 6,
                    })}
                  />
                  <span>max</span>
                </label>
                <button
                  className="btn btn-square md:btn-wide"
                  onClick={() => handleIncrease("maxPersonCount")}
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
              {post ? "Mentés" : "Közzététel"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
