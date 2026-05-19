"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

type ShareModalProps = {
  url: string;
  title?: string;
};

export const ShareModal = ({ url, title }: ShareModalProps) => {
  const t = useTranslations("share");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  };

  const openShare = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ url, title });
    } catch {
      // User cancelled or share failed — silently ignore.
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title ?? "");

  const options: Array<{ key: string; label: string; icon: React.ReactNode; onClick: () => void }> =
    [
      {
        key: "email",
        label: t("email"),
        icon: <Mail className="size-4" />,
        onClick: () => openShare(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`),
      },
      {
        key: "whatsapp",
        label: t("whatsapp"),
        icon: <MessageCircle className="size-4" />,
        onClick: () => openShare(`https://wa.me/?text=${encodedUrl}`),
      },
      {
        key: "facebook",
        label: t("facebook"),
        icon: <ThumbsUp className="size-4" />,
        onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
      },
      {
        key: "twitter",
        label: t("twitter"),
        icon: <Send className="size-4" />,
        onClick: () =>
          openShare(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`),
      },
    ];

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Share2 />
        <span className="sr-only sm:hidden">{t("trigger")}</span>
        <span className="hidden sm:inline">{t("trigger")}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <Input value={url} readOnly className="text-[13px]" />
            <Button
              type="button"
              variant={copied ? "default" : "outline"}
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <Check /> : <Copy />}
              {copied ? t("copied") : t("copyLink")}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {options.map((opt) => (
              <Button
                key={opt.key}
                type="button"
                variant="outline"
                onClick={opt.onClick}
                className="justify-start"
              >
                {opt.icon}
                {opt.label}
              </Button>
            ))}
            {canNativeShare && (
              <Button
                type="button"
                variant="outline"
                onClick={handleNativeShare}
                className="justify-start"
              >
                <MoreHorizontal className="size-4" />
                {t("more")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
