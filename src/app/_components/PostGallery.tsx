"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { Image as TImage } from "@prisma/client";
import { useTranslations } from "next-intl";

type Props = {
  images: TImage[];
  alt?: string;
};

export function PostGallery({ images, alt = "" }: Props) {
  const t = useTranslations("post");

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
      <div
        className="relative w-full overflow-hidden rounded-[24px]"
        style={{ aspectRatio: "16 / 11", background: "var(--ink-05)" }}
      >
        <Image src={hero.url} alt={alt} fill sizes="(max-width: 1024px) 100vw, 1240px" className="object-cover" priority />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-2">
      <div
        className="relative col-span-12 overflow-hidden rounded-[24px] md:col-span-8 md:rounded-r-none"
        style={{ aspectRatio: "16 / 11", background: "var(--ink-05)" }}
      >
        <Image src={hero.url} alt={alt} fill sizes="(max-width: 1024px) 100vw, 820px" className="object-cover" priority />
      </div>
      <div className="col-span-12 grid grid-rows-2 gap-2 md:col-span-4">
        {right.map((img, i) => (
          <div
            key={img.id}
            className={
              "relative overflow-hidden rounded-[24px] md:rounded-l-none " +
              (i === 0
                ? "md:rounded-br-none md:rounded-tr-[24px]"
                : "md:rounded-tr-none md:rounded-br-[24px]")
            }
            style={{ background: "var(--ink-05)", minHeight: 140 }}
          >
            <Image src={img.url} alt={alt} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
            {i === 1 && images.length > 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[12px] font-semibold text-white backdrop-blur-sm">
                {t("morePhotos", { count: images.length - 3 })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
