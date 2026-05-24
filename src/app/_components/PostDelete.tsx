"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "~/i18n/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

type PostDeleteProps = { id: number };

export const PostDelete = ({ id }: PostDeleteProps) => {
  const router = useRouter();
  const t = useTranslations("post");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const deletePost = api.post.deleteById.useMutation({
    onSuccess: async () => {
      setOpen(false);
      await Promise.all([
        utils.post.getLatest.invalidate(),
        utils.post.getAllByUserId.invalidate(),
      ]);
      router.push("/");
      toast.success(t("deleteSuccess"));
    },
    onError: (error) => {
      setOpen(false);
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={(o) => !deletePost.isPending && setOpen(o)}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          <Trash2 />
          <span className="sr-only sm:hidden">{tc("delete")}</span>
          <span className="hidden sm:inline">{tc("delete")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">{t("deleteConfirm")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePost.isPending}>{tc("cancel")}</AlertDialogCancel>
          <Button
            type="button"
            onClick={() => deletePost.mutate(id)}
            disabled={deletePost.isPending}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {deletePost.isPending && <Loader2 className="animate-spin" />}
            {tc("yes")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
