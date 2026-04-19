"use client";

import type { Image as TImage } from "@prisma/client";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";

type CarouselProps = {
  images: TImage[];
};

export const Images = ({ images }: CarouselProps) => {
  if (!images.length)
    return (
      <div className="from-base-200 to-base-300 flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br">
        <PhotoIcon width={48} className="opacity-30" />
      </div>
    );
  return (
    <Carousel
      className="w-full overflow-hidden rounded-2xl"
      showThumbs={false}
      showStatus={false}
      dynamicHeight={true}
    >
      {images.map(({ url }, index) => (
        <div key={index} className="relative aspect-[4/3] w-full">
          <Image
            fill
            src={url}
            className="object-cover"
            alt={url}
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ))}
    </Carousel>
  );
};
