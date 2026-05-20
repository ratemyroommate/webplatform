"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "~/lib/utils";

export type PostCardCarouselImage = { id: string | number; url: string };

type Props = {
  images: PostCardCarouselImage[];
  alt: string;
  sizes: string;
};

/**
 * Airbnb-style swipeable image gallery for post cards.
 * - Native CSS scroll-snap horizontal scroller (smooth touch on mobile)
 * - Pagination dots overlay
 * - Hover-only chevron buttons on desktop, which preventDefault so they
 *   don't trigger the surrounding <Link> navigation.
 */
export function PostCardCarousel({ images, alt, sizes }: Props) {
  const t = useTranslations("post.viewer");
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = React.useState(0);
  const total = images.length;

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  const stopLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="group/carousel relative h-full w-full overflow-hidden">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <div key={img.id} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
            <Image
              src={img.url}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover"
              priority={i === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          {/* Dots */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full bg-white shadow transition-all duration-200",
                  i === index ? "w-3 opacity-100" : "w-1.5 opacity-70"
                )}
              />
            ))}
          </div>

          {index > 0 && (
            <button
              type="button"
              aria-label={t("previous")}
              onClick={(e) => {
                stopLink(e);
                goTo(index - 1);
              }}
              className="absolute top-1/2 left-2 z-10 hidden h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-black opacity-0 shadow-md transition group-hover/carousel:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:flex"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {index < total - 1 && (
            <button
              type="button"
              aria-label={t("next")}
              onClick={(e) => {
                stopLink(e);
                goTo(index + 1);
              }}
              className="absolute top-1/2 right-2 z-10 hidden h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-black opacity-0 shadow-md transition group-hover/carousel:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:flex"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
