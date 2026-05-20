"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { Image as TImage } from "@prisma/client";
import { useTranslations } from "next-intl";

import { ImageViewer } from "~/app/_components/ImageViewer";

type Props = {
  images: TImage[];
  alt?: string;
};

export function PostGallery({ images, alt = "" }: Props) {
  const t = useTranslations("post");
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerIndex, setViewerIndex] = React.useState(0);

  const open = (i: number) => {
    setViewerIndex(i);
    setViewerOpen(true);
  };

  const viewer = (
    <ImageViewer
      images={images}
      open={viewerOpen}
      onOpenChange={setViewerOpen}
      initialIndex={viewerIndex}
      alt={alt}
    />
  );

  if (!images.length) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-[24px]"
        style={{ aspectRatio: "16 / 11", background: "var(--ink-05)" }}
      >
        <ImageIcon size={48} className="opacity-30" />
      </div>
    );
  }

  const hero = images[0]!;
  const right = images.slice(1, 3);

  if (right.length === 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => open(0)}
          aria-label={t("viewer.openLabel", { index: 1, total: images.length })}
          className="focus-visible:ring-ring relative block w-full cursor-zoom-in overflow-hidden rounded-[24px] focus:outline-none focus-visible:ring-2"
          style={{ aspectRatio: "16 / 11", background: "var(--ink-05)" }}
        >
          <Image
            src={hero.url}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 1240px"
            className="object-cover"
            priority
          />
        </button>
        {viewer}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <button
          type="button"
          onClick={() => open(0)}
          aria-label={t("viewer.openLabel", { index: 1, total: images.length })}
          className="focus-visible:ring-ring relative col-span-12 block cursor-zoom-in overflow-hidden rounded-[24px] focus:outline-none focus-visible:ring-2 md:col-span-8 md:rounded-r-none"
          style={{ aspectRatio: "16 / 11", background: "var(--ink-05)" }}
        >
          <Image
            src={hero.url}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 820px"
            className="object-cover"
            priority
          />
        </button>
        <div
          className={
            "col-span-12 grid gap-2 md:col-span-4 " +
            (right.length === 2 ? "grid-rows-2" : "grid-rows-1")
          }
        >
          {right.map((img, i) => {
            const isOnly = right.length === 1;
            const cornerClasses = isOnly
              ? "md:rounded-tr-[24px] md:rounded-br-[24px]"
              : i === 0
                ? "md:rounded-tr-[24px] md:rounded-br-none"
                : "md:rounded-tr-none md:rounded-br-[24px]";
            const tileIndex = i + 1; // hero is 0
            const isOverflowTile = i === 1 && images.length > 3;
            const targetIndex = isOverflowTile ? 3 : tileIndex;
            const label = isOverflowTile
              ? t("viewer.viewAll", { count: images.length })
              : t("viewer.openLabel", {
                  index: tileIndex + 1,
                  total: images.length,
                });
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => open(targetIndex)}
                aria-label={label}
                className={
                  "focus-visible:ring-ring relative block cursor-zoom-in overflow-hidden rounded-[24px] focus:outline-none focus-visible:ring-2 md:rounded-l-none " +
                  cornerClasses
                }
                style={{ background: "var(--ink-05)", minHeight: 140 }}
              >
                <Image
                  src={img.url}
                  alt={alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
                {isOverflowTile && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[12px] font-semibold text-white backdrop-blur-sm">
                    {t("morePhotos", { count: images.length - 3 })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {viewer}
    </>
  );
}
