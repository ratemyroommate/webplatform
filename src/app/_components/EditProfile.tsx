"use client";

import { Pencil } from "lucide-react";
import type { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useRouter } from "~/i18n/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

type FormValues = {
  about: string | null;
  socialLink: string | null;
  phoneNumber: string | null;
  phoneNumberConsent: boolean;
};

type EditProfileProps = User & {
  /**
   * When provided, the dialog becomes controlled and the default pencil
   * trigger is hidden. Used by the owner-only profile section so the
   * ProfileCompleteness "fix" buttons can open the same dialog.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const EditProfile = ({ open: openProp, onOpenChange, ...user }: EditProfileProps) => {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const { register, handleSubmit, formState, watch, setValue, setError, clearErrors } =
    useForm<FormValues>({
      defaultValues: {
        about: user.about,
        socialLink: user.socialLink,
        phoneNumber: user.phoneNumber,
        phoneNumberConsent: !!user.phoneNumber,
      },
    });

  const phoneValue = watch("phoneNumber");
  const phoneConsent = watch("phoneNumberConsent");

  const router = useRouter();
  const utils = api.useUtils();
  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      router.refresh();
      setOpen(false);
      toast.success(t("updateSuccess"));
      void utils.user.getProfileCompleteness.invalidate();
    },
  });

  const onSubmit = (formValues: FormValues) => {
    const phone = formValues.phoneNumber?.trim() ?? "";
    if (phone && !formValues.phoneNumberConsent) {
      setError("phoneNumberConsent", {
        type: "required",
        message: t("phoneNumberConsentRequired"),
      });
      return;
    }
    updateUser.mutate({
      id: user.id,
      about: formValues.about?.trim() ? formValues.about.trim() : null,
      socialLink: formValues.socialLink?.trim() ? formValues.socialLink.trim() : null,
      phoneNumber: phone || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Pencil />
            {t("editProfile")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editProfile")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="socialLink">{t("socialLink")}</Label>
            <Input
              id="socialLink"
              placeholder={t("socialLinkPlaceholder")}
              {...register("socialLink", {
                required: tc("required"),
                validate: (value) =>
                  !value || /^https?:\/\/.+/.test(value.trim()) || t("socialLinkInvalid"),
              })}
            />
            {formState.errors.socialLink && (
              <span className="text-destructive text-xs">
                {formState.errors.socialLink?.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="about">{t("about")}</Label>
            <Textarea
              id="about"
              placeholder={t("aboutPlaceholder")}
              {...register("about", { required: tc("required") })}
            />
            {formState.errors.about && (
              <span className="text-destructive text-xs">{formState.errors.about?.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
            <Input
              id="phoneNumber"
              placeholder={t("phoneNumberPlaceholder")}
              {...register("phoneNumber", {
                validate: (value) =>
                  !value?.trim() ||
                  /^\+?[\d\s\-()]{6,20}$/.test(value.trim()) ||
                  t("phoneNumberInvalid"),
              })}
            />
            {formState.errors.phoneNumber && (
              <span className="text-destructive text-xs">
                {formState.errors.phoneNumber?.message}
              </span>
            )}
          </div>

          {phoneValue?.trim() && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="phoneNumberConsent"
                checked={phoneConsent}
                onCheckedChange={(checked) => {
                  const value = checked === true;
                  setValue("phoneNumberConsent", value);
                  if (value) clearErrors("phoneNumberConsent");
                }}
              />
              <Label htmlFor="phoneNumberConsent" className="text-sm leading-snug font-medium">
                {t("phoneNumberConsent")}
              </Label>
            </div>
          )}
          {formState.errors.phoneNumberConsent && (
            <span className="text-destructive text-xs">
              {formState.errors.phoneNumberConsent?.message}
            </span>
          )}
          <Button disabled={formState.isSubmitting || updateUser.isPending} type="submit">
            {tc("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
