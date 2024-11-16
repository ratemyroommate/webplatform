import { Post } from "@prisma/client";

declare global {
  type PostExtended = Post & {
    featuredUsers: {
      id: string;
      image: string | null;
      name: string | null;
      reviewsReceived: { rating: number }[];
    }[];
  };
}
