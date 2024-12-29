import { Image } from "@prisma/client";

type CarouselProps = {
  images: Image[];
  id: number;
};

export const Carousel = ({ images, id }: CarouselProps) => {
  if (!images.length) return <div className="skeleton h-60 w-full"></div>;
  return (
    <div className="carousel w-full rounded-xl">
      {images.map(({ url }, index) => (
        <div
          key={index}
          id={`slide${id}${index}`}
          className="carousel-item relative w-full"
        >
          <img src={url} className="w-full" />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a
              href={`#slide${id}${index - 1}`}
              className={index === 0 ? "invisible" : "btn btn-circle"}
            >
              ❮
            </a>

            <a
              href={`#slide${id}${index + 1}`}
              className={
                index + 1 === images.length ? "invisible" : "btn btn-circle"
              }
            >
              ❯
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
