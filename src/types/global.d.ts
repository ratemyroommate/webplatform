import type { Post, Image } from "@prisma/client";

declare global {
  type PostExtended = Post & {
    images: Image[];
    featuredUsers: {
      id: string;
      image: string | null;
      name: string | null;
      reviewsReceived: { rating: number }[];
    }[];
  };
}
