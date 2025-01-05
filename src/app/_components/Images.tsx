"use client";

import { Image } from "@prisma/client";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

type CarouselProps = {
  images: Image[];
};

export const Images = ({ images }: CarouselProps) => {
  if (!images.length) return <div className="skeleton h-60 w-full"></div>;
  return (
    <Carousel
      className="overflow-hidden rounded-lg"
      showThumbs={false}
      showStatus={false}
      dynamicHeight={true}
    >
      {images.map(({ url }, index) => (
        <div key={index} className="relative w-full">
          <img src={url} className="w-full" />
        </div>
      ))}
    </Carousel>
  );
};
