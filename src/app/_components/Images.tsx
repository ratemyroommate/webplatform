"use client";

import { Image as TImage } from "@prisma/client";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

type CarouselProps = {
  images: TImage[];
};

export const Images = ({ images }: CarouselProps) => {
  if (!images.length) return <div className="skeleton h-60 w-full"></div>;
  return (
    <Carousel
      className="w-full overflow-hidden rounded-lg lg:max-w-sm"
      showThumbs={false}
      showStatus={false}
      dynamicHeight={true}
    >
      {images.map(({ url }, index) => (
        <div key={index} className="relative w-full">
          <Image
            width="100"
            height="100"
            src={url}
            className="w-full"
            alt={url}
          />
        </div>
      ))}
    </Carousel>
  );
};
