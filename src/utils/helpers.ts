import { User } from "@prisma/client";

export const getAverageRating = (
  user: User & { reviewsReceived: { rating: number }[] },
) =>
  user.reviewsReceived.length
    ? user.reviewsReceived.reduce((sum, { rating }) => sum + rating, 0) /
      user.reviewsReceived.length
    : 0;
