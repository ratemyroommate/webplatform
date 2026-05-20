"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

type Props = {
  images: { id: string | number; url: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
  alt?: string;
};

const SWIPE_THRESHOLD = 50;

export function ImageViewer({ images, open, onOpenChange, initialIndex = 0, alt = "" }: Props) {
  const t = useTranslations("post.viewer");
  const [index, setIndex] = React.useState(initialIndex);
  const touchStartX = React.useRef<number | null>(null);

  const total = images.length;
  const canNavigate = total > 1;

  // Reset index when the viewer opens or initialIndex changes
  React.useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const goPrev = React.useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = React.useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open || !canNavigate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, canNavigate, goPrev, goNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !canNavigate) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx > 0) goPrev();
    else goNext();
  };

  if (!total) return null;

  // Render current ± 1 to preload neighbours without loading everything
  const visibleIndexes = new Set<number>([index]);
  if (canNavigate) {
    visibleIndexes.add((index - 1 + total) % total);
    visibleIndexes.add((index + 1) % total);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "h-screen w-screen max-w-none translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden rounded-none border-0 bg-black/95 p-0 shadow-none",
          "sm:max-w-none sm:rounded-none"
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("description")}</DialogDescription>

        {/* Swipe / tap-to-close surface */}
        <div
          className="relative h-full w-full select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Images */}
          {images.map((img, i) => {
            if (!visibleIndexes.has(i)) return null;
            const isActive = i === index;
            return (
              <div
                key={img.id}
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                  isActive ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                style={{
                  paddingTop: "env(safe-area-inset-top)",
                  paddingBottom: "env(safe-area-inset-bottom)",
                }}
              >
                <Image
                  src={img.url}
                  alt={alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority={isActive}
                />
              </div>
            );
          })}

          {/* Counter */}
          {canNavigate && (
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[13px] font-medium text-white backdrop-blur-sm"
              style={{ top: "calc(env(safe-area-inset-top) + 16px)" }}
            >
              {t("counter", { current: index + 1, total })}
            </div>
          )}

          {/* Close */}
          <DialogPrimitive.Close
            aria-label={t("close")}
            className="absolute z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              top: "calc(env(safe-area-inset-top) + 12px)",
              right: "calc(env(safe-area-inset-right) + 12px)",
            }}
          >
            <X size={20} />
          </DialogPrimitive.Close>

          {/* Prev / Next */}
          {canNavigate && (
            <>
              <button
                type="button"
                aria-label={t("previous")}
                onClick={goPrev}
                className="absolute top-1/2 left-3 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label={t("next")}
                onClick={goNext}
                className="absolute top-1/2 right-3 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
