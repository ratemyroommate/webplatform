import { Post, User } from "@prisma/client";

export const getAverageRating = (
  user: PostExtended["featuredUsers"][number],
) =>
  user.reviewsReceived.length
    ? user.reviewsReceived.reduce((sum, { rating }) => sum + rating, 0) /
      user.reviewsReceived.length
    : 0;

export const isUserInPostGroup = (
  post: Post & { featuredUsers: Partial<User>[] },
  userId: string,
) => post.featuredUsers.map((user) => user.id).includes(userId);
