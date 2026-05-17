"use client";

import { Minus, Plus, Pencil, X } from "lucide-react";
import type { Post } from "@prisma/client";
import { Location } from "@prisma/client";
import { useLoginModal } from "./LoginModal";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ageOptions, genderOptions, isUserInPostGroup, locationOptions } from "~/utils/helpers";
import { genUploader } from "uploadthing/client";
import type { ChangeEvent } from "react";
import { compressImages } from "~/utils/imagecompression";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
  const [open, setOpen] = useState(false);
  const loginModal = useLoginModal();
  const {
    watch,
    reset,
    register,
    setError,
    setValue,
    getValues,
    control,
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
  const successMessage = post ? t("updateSuccess") : t("createSuccess");
  const utils = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      void utils.post.getLatest.invalidate();
      setOpen(false);
      toast.success(successMessage);
      reset();
    },
    onError: (error) => {
      setOpen(false);
      toast.error(error.message);
    },
  });
  const updatePost = api.post.update.useMutation({
    onSuccess: () => {
      router.refresh();
      setOpen(false);
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
  const isResidentValue = watch("isResident");
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
    } catch {
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

  const handleTriggerClick = () => {
    if (!userId) {
      loginModal.open();
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleTriggerClick}
        variant={post ? "outline" : "default"}
        className={post ? "flex-1" : "flex-1 shadow-md"}
      >
        {post ? (
          <>
            <Pencil />
            {tc("edit")}
          </>
        ) : (
          <>
            <Plus />
            {t("newPost")}
          </>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{post ? t("editTitle") : t("createTitle")}</DialogTitle>
          </DialogHeader>
          <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label>{t("images")}</Label>
              <Input
                name="images"
                max={4}
                multiple
                type="file"
                accept="image/*"
                onChange={handleImagesChange}
              />
              {errors.images?.message && (
                <span className="text-destructive text-xs">{errors.images.message}</span>
              )}
              {!!previewImages.length && (
                <div className="relative flex h-24 w-full flex-row gap-4 overflow-x-scroll py-2">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative flex h-full flex-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={index}
                        src={image.url}
                        alt=""
                        className="relative h-full rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-destructive absolute top-0 right-0 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("rent")}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDecrease("price")}
                >
                  <Minus />
                </Button>
                <div className="relative flex flex-1 items-center">
                  <Input
                    min={10}
                    max={999}
                    type="number"
                    className="pr-12"
                    value={watch("price") ?? ""}
                    onChange={(e) => setValue("price", Number(e.target.value))}
                  />
                  <span className="text-muted-foreground absolute right-3 text-sm">
                    {t("rentUnit")}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleIncrease("price")}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("where")}</Label>
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("wherePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {te(`location.${opt.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("age")}</Label>
              <Controller
                control={control}
                name="age"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("age")} />
                    </SelectTrigger>
                    <SelectContent>
                      {ageOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {te(`age.${opt.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("genderPreference")}</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("gender")} />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {te(`gender.${opt.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                placeholder={t("descriptionPlaceholder")}
                {...register("description", { required: t("descriptionRequired") })}
              />
              {errors.description && (
                <span className="text-destructive text-xs">{errors.description.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("personCount")}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDecrease("maxPersonCount")}
                >
                  <Minus />
                </Button>
                <div className="relative flex flex-1 items-center">
                  <Input
                    min={2}
                    max={6}
                    type="number"
                    className="pr-12"
                    value={watch("maxPersonCount") ?? ""}
                    onChange={(e) => setValue("maxPersonCount", Number(e.target.value))}
                  />
                  <span className="text-muted-foreground absolute right-3 text-sm">max</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleIncrease("maxPersonCount")}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isResident"
                checked={isResidentValue}
                onCheckedChange={(checked) => setValue("isResident", checked === true)}
              />
              <Label htmlFor="isResident">{t("isResident")}</Label>
            </div>

            <Button disabled={isSubmitting} type="submit" className="mt-2 self-center px-12">
              {uploadStatus ?? (post ? tc("save") : tc("publish"))}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
