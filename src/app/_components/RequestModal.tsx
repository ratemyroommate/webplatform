"use client";

import { Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { useRouter } from "~/i18n/navigation";
import { useState } from "react";
import { useLoginModal } from "./LoginModal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";

type ReviewProps = { postId: number; userId?: string };
type FormValues = { comment: string | null };

export const RequestModal = ({ postId, userId }: ReviewProps) => {
  const t = useTranslations("request");
  const [open, setOpen] = useState(false);
  const loginModal = useLoginModal();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { comment: "" },
  });

  const router = useRouter();
  const utils = api.useUtils();
  const reviewMutation = api.request.create.useMutation({
    onSuccess: async () => {
      await utils.request.getAll.invalidate();
      router.refresh();
      setOpen(false);
      toast.success(t("success"));
    },
  });

  const onSubmit = (formValues: FormValues) => reviewMutation.mutate({ ...formValues, postId });

  const handleTriggerClick = () => {
    if (!userId) {
      loginModal.open();
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button onClick={handleTriggerClick} className="w-full shadow-md">
        <Users />
        {t("apply")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Textarea placeholder={t("commentPlaceholder")} {...register("comment")} />
            <Button type="submit" disabled={formState.isSubmitting || reviewMutation.isPending}>
              {t("send")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
