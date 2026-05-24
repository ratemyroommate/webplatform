"use client";

import { Loader2, Pencil, Plus } from "lucide-react";
import { Rating } from "./Rating";
import { useForm } from "react-hook-form";
import { useRouter } from "~/i18n/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useLoginModal } from "./LoginModal";
import type { Review } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";

type ReviewProps = {
  review?: Pick<Review, "rating" | "comment">;
  reviewedId: string;
  reviewerId?: string;
};
type FormValues = { rating: number; comment: string | null };

export const ReviewModal = ({ review, reviewedId, reviewerId }: ReviewProps) => {
  const t = useTranslations("review");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const loginModal = useLoginModal();

  const { register, watch, setValue, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: review
      ? { rating: review.rating, comment: review.comment }
      : { rating: 5, comment: "" },
  });

  const router = useRouter();
  const successMessage = review ? t("updateSuccess") : t("createSuccess");
  const reviewMutation = api.review[review ? "update" : "create"].useMutation({
    onSuccess: () => {
      router.refresh();
      setOpen(false);
      toast.success(successMessage);
    },
  });

  const onSubmit = (formValues: FormValues) => reviewMutation.mutate({ ...formValues, reviewedId });
  const handleRatingClick = (rating: number) => setValue("rating", rating);

  const handleTriggerClick = () => {
    if (!reviewerId) {
      loginModal.open();
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleTriggerClick}
        variant={review ? "outline" : "default"}
        className={review ? "" : "w-full shadow-md"}
      >
        {review ? (
          <>
            <Pencil />
            {tc("edit")}
          </>
        ) : (
          <>
            <Plus />
            {t("newReview")}
          </>
        )}
      </Button>
      <Dialog open={open} onOpenChange={(o) => !reviewMutation.isPending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Rating rating={watch("rating")} itemKey={-1} isLarge onClick={handleRatingClick} />
            <Textarea placeholder={t("commentPlaceholder")} {...register("comment")} />
            <Button type="submit" disabled={formState.isSubmitting || reviewMutation.isPending}>
              {reviewMutation.isPending && <Loader2 className="animate-spin" />}
              {tc("publish")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
