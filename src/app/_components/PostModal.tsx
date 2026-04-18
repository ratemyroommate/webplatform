"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Post, Location } from "@prisma/client";
import { LoginModal, handleCloseModal, handleOpenModal } from "./LoginModal";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ageOptions, genderOptions, isUserInPostGroup, locationOptions } from "~/utils/helpers";
import { genUploader } from "uploadthing/client";
import { ChangeEvent } from "react";
import { compressImages } from "~/utils/imagecompression";
import { XButton } from "./CloseButton";
import { useState } from "react";
import { useTranslations } from "next-intl";

export const { uploadFiles } = genUploader({ package: "uploadthing/client" });

type PostModalProps = {
  post?: PostExtended;
  userId?: string;
};

type FormValues = Omit<Post, "id" | "createdAt" | "updatedAt" | "createdById" | "images"> & {
  isResident: boolean;
  images: File[];
  removeImages: string[];
};

const defaultValues = {
  description: "",
  maxPersonCount: 2,
  isResident: true,
  images: [],
  removeImages: [],
  price: 80,
  location: Location.BUDAPEST,
  age: 0,
  gender: 0,
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
    clearErrors,
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
          location: post.location,
          age: post.age,
          gender: post.gender,
        }
      : defaultValues,
  });

  const router = useRouter();
  const t = useTranslations("post");
  const tc = useTranslations("common");
  const te = useTranslations("enums");
  const modalId = userId ? (post ? `post-modal-${post.id}` : "post-modal") : "login-modal";
  const successMessage = post ? t("updateSuccess") : t("createSuccess");
  const utils = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      void utils.post.getLatest.invalidate();
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
      setValue("images", []);
      setValue("removeImages", []);
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
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const onSubmit = async (formValues: FormValues) => {
    try {
      setUploadStatus(t("uploadCompressing"));
      const files = await compressImages(images);

      setUploadStatus(t("uploadUploading"));
      const response = await uploadFiles("imageUploader", { files });

      const imageInfos = response.map(({ key, url }) => ({
        id: key,
        url,
      }));

      setUploadStatus(t("uploadSaving"));
      if (post)
        await updatePost.mutateAsync({
          ...formValues,
          images: imageInfos,
          removeImages,
          id: post.id,
        });
      else await createPost.mutateAsync({ ...formValues, images: imageInfos });
    } catch (error) {
      toast.error(t("uploadError"));
    } finally {
      setUploadStatus(null);
    }
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) return;

    setValue("images", [...getValues("images"), ...Array.from(files)]);

    if (previewImages.length + files.length > 4) {
      setError("images", {
        message: t("maxImages"),
      });
    }
  };

  const postImages = post ? post.images : [];
  const previewPostImages = postImages.filter((image) => !removeImages.includes(image.id));
  const newImages = images.map((image) => ({
    url: URL.createObjectURL(image),
  }));
  const previewImages = [...previewPostImages, ...newImages];

  const removeImage = (index: number) => {
    if (index < previewPostImages.length) {
      const removeImage = previewPostImages[index]?.id;
      if (!removeImage) return;
      return setValue("removeImages", [...getValues("removeImages"), removeImage]);
    }

    setValue(
      "images",
      getValues("images").filter((_, idx) => idx !== index - previewPostImages.length)
    );

    if (previewImages.length - 1 < 5) {
      clearErrors("images");
    }
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
            {tc("edit")}
          </>
        ) : (
          <>
            <PlusIcon width={20} />
            {t("newPost")}
          </>
        )}
      </button>
      <LoginModal />
      <dialog id={post ? `post-modal-${post.id}` : "post-modal"} className="modal">
        <div className="modal-box max-w-5xl">
          <h3 className="pb-2 text-lg font-bold">{post ? t("editTitle") : t("createTitle")}</h3>
          <XButton />
          <form className="flex w-full flex-col" onSubmit={handleSubmit(onSubmit)}>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">{t("images")}</span>
              </div>
            </label>

            <input
              name="images"
              max={4}
              multiple
              type="file"
              accept="image/*"
              onChange={handleImagesChange}
              className="file-input file-input-bordered w-full max-w-xs"
            />
            {errors.images?.message && (
              <div className="label">
                <span className="label-text-alt text-orange-600">{errors.images.message}</span>
              </div>
            )}
            {!!previewImages.length && (
              <div className="relative flex h-24 w-full flex-row gap-4 overflow-x-scroll py-2">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative flex h-full flex-none">
                    <img key={index} src={image.url} className="relative h-full rounded-lg" />
                    <div
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-400"
                    >
                      ✕
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text">{t("rent")}</span>
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
                  <span>{t("rentUnit")}</span>
                </label>
                <button
                  className="btn btn-square md:btn-wide"
                  onClick={() => handleIncrease("price")}
                  type="button"
                >
                  <PlusIcon width={20} />
                </button>
              </div>
            </div>

            <label className="fieldset-label">{t("where")}</label>
            <select defaultValue="Budapest" className="select w-full" {...register("location")}>
              <option disabled={true}>{t("wherePlaceholder")}</option>
              {locationOptions.map((locationOption) => (
                <option key={locationOption.value} value={locationOption.value}>
                  {te(`location.${locationOption.value}`)}
                </option>
              ))}
            </select>

            <label className="fieldset-label">{t("age")}</label>
            <select className="select w-full" {...register("age", { valueAsNumber: true })}>
              <option defaultValue={0} disabled={true}>
                {t("age")}
              </option>
              {ageOptions.map((ageOption) => (
                <option key={ageOption.value} value={ageOption.value}>
                  {te(`age.${ageOption.value}`)}
                </option>
              ))}
            </select>

            <label className="fieldset-label">{t("genderPreference")}</label>
            <select className="select w-full" {...register("gender", { valueAsNumber: true })}>
              <option defaultValue={0} disabled={true}>
                {t("gender")}
              </option>
              {genderOptions.map((gender) => (
                <option key={gender.value} value={gender.value}>
                  {te(`gender.${gender.value}`)}
                </option>
              ))}
            </select>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">{t("description")}</span>
              </div>
              <textarea
                placeholder={t("descriptionPlaceholder")}
                className="textarea textarea-bordered textarea-lg w-full"
                {...register("description", { required: t("descriptionRequired") })}
              ></textarea>
              {errors.description && (
                <div className="label">
                  <span className="label-text-alt text-orange-600">
                    {errors.description.message}
                  </span>
                </div>
              )}
            </label>
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text">{t("personCount")}</span>
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
            </div>
            <div className="form-control py-2">
              <label className="label cursor-pointer justify-start gap-4">
                <span className="label-text">{t("isResident")}</span>
                <input type="checkbox" {...register("isResident")} className="checkbox" />
              </label>
            </div>
            <button disabled={isSubmitting} className="btn btn-secondary btn-wide mt-4 self-center">
              {uploadStatus ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {uploadStatus}
                </>
              ) : post ? (
                tc("save")
              ) : (
                tc("publish")
              )}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
