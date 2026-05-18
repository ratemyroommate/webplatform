"use client";

import { ImagePlus, Minus, Pencil, Plus, Send, X } from "lucide-react";
import type { Post } from "@prisma/client";
import { Location } from "@prisma/client";
import { useLoginModal } from "./LoginModal";
import { useRouter } from "~/i18n/navigation";
import { api } from "~/trpc/react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ageOptions, genderOptions, isUserInPostGroup, locationOptions } from "~/utils/helpers";
import { genUploader } from "uploadthing/client";
import type { ChangeEvent } from "react";
import { compressImages } from "~/utils/imagecompression";
import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
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

export const PostModal = ({
  post,
  userId,
  renderTrigger,
}: PostModalProps & { renderTrigger?: (open: () => void) => React.ReactNode }) => {
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
      {renderTrigger ? (
        renderTrigger(handleTriggerClick)
      ) : (
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
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-foreground text-[20px] font-extrabold tracking-[-0.015em]">
              {post ? t("editTitle") : t("createTitle")}
            </DialogTitle>
          </DialogHeader>
          <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Image dropzone */}
            <Field label={t("images")}>
              <ImageDropzone
                onChange={handleImagesChange}
                browseLabel={t("imagesBrowse")}
                dropLabel={t("imagesDrop")}
                hintLabel={t("imagesHint")}
              />
              {errors.images?.message && (
                <span className="text-destructive text-xs">{errors.images.message}</span>
              )}
              {!!previewImages.length && (
                <div className="relative flex h-24 w-full flex-row gap-4 overflow-x-auto py-2">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative flex h-full flex-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt="" className="relative h-full rounded-lg" />
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
            </Field>

            {/* Rent + headcount steppers */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("rent")}>
                <StepperField
                  value={watch("price") ?? 0}
                  onDecrease={() => handleDecrease("price")}
                  onIncrease={() => handleIncrease("price")}
                  onChange={(v) => setValue("price", v)}
                  min={min.price}
                  max={max.price}
                  unit={t("rentUnit")}
                />
              </Field>
              <Field label={t("personCount")}>
                <StepperField
                  value={watch("maxPersonCount") ?? 0}
                  onDecrease={() => handleDecrease("maxPersonCount")}
                  onIncrease={() => handleIncrease("maxPersonCount")}
                  onChange={(v) => setValue("maxPersonCount", v)}
                  min={min.maxPersonCount}
                  max={max.maxPersonCount}
                  unit={t("max")}
                />
              </Field>
            </div>

            {/* Location / age / gender */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={t("where")}>
                <Controller
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full rounded-xl">
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
              </Field>

              <Field label={t("age")}>
                <Controller
                  control={control}
                  name="age"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
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
              </Field>

              <Field label={t("genderPreference")}>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
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
              </Field>
            </div>

            {/* Description */}
            <Field label={t("description")}>
              <textarea
                id="description"
                rows={4}
                placeholder={t("descriptionPlaceholder")}
                {...register("description", { required: t("descriptionRequired") })}
                className="text-foreground w-full rounded-xl border border-[color:var(--ink-15)] bg-[var(--card)] px-4 py-3 text-[13.5px] placeholder:text-[color:var(--ink-50)] focus:border-[color:var(--ink-40)] focus:outline-none"
              />
              {errors.description && (
                <span className="text-destructive text-xs">{errors.description.message}</span>
              )}
            </Field>

            {/* Self-resident toggle */}
            <ResidentToggle
              checked={isResidentValue}
              onChange={(checked) => setValue("isResident", checked)}
              label={t("isResident")}
            />

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {!uploadStatus && !post && <Send />}
                {uploadStatus ?? (post ? tc("save") : tc("publish"))}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-medium tracking-[0.1em] text-[color:var(--ink-60)] uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function StepperField({
  value,
  onDecrease,
  onIncrease,
  onChange,
  min,
  max,
  unit,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const [draft, setDraft] = useState<string>(String(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);
  return (
    <div className="flex h-11 items-center overflow-hidden rounded-xl border border-[color:var(--ink-15)] bg-[var(--card)]">
      <button
        type="button"
        onClick={onDecrease}
        className="h-full w-11 text-[color:var(--ink-60)] transition-colors hover:bg-[color:var(--ink-05)]"
        aria-label="decrease"
      >
        <Minus className="mx-auto" size={14} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={focused ? draft : String(value)}
        onFocus={() => {
          setFocused(true);
          setDraft(String(value));
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          setDraft(raw);
        }}
        onBlur={() => {
          setFocused(false);
          if (draft === "") {
            onChange(min);
            return;
          }
          const parsed = Number(draft);
          if (Number.isNaN(parsed)) onChange(min);
          else onChange(clamp(Math.trunc(parsed)));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="text-foreground w-full min-w-0 flex-1 bg-transparent text-center text-[14px] font-semibold tabular-nums focus:outline-none"
      />
      <span className="pr-3 text-[11px] text-[color:var(--ink-60)]">{unit}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="h-full w-11 text-[color:var(--ink-60)] transition-colors hover:bg-[color:var(--ink-05)]"
        aria-label="increase"
      >
        <Plus className="mx-auto" size={14} />
      </button>
    </div>
  );
}

function ImageDropzone({
  onChange,
  dropLabel,
  browseLabel,
  hintLabel,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  dropLabel: string;
  browseLabel: string;
  hintLabel: string;
}) {
  const inputId = useId();
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[color:var(--ink-15)] bg-[var(--background)] p-8 transition-colors",
        "hover:border-[var(--primary)]"
      )}
    >
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--primary-10)", color: "var(--primary)" }}
      >
        <ImagePlus size={20} strokeWidth={1.75} />
      </span>
      <div className="text-center text-[13.5px] text-[color:var(--ink-70)]">
        {dropLabel} <span className="font-semibold text-[var(--primary)]">{browseLabel}</span>
      </div>
      <div className="text-[11px] text-[color:var(--ink-50)]">{hintLabel}</div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        max={4}
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}

function ResidentToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--ink-10)] bg-[var(--background)] p-3.5">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="size-5 rounded-md"
      />
      <span className="text-foreground text-[13.5px] font-medium">{label}</span>
    </label>
  );
}
