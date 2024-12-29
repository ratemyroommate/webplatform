import { Post, User } from "@prisma/client";
import { OrderBy } from "~/app/_components/Filters";

export const getAverageRating = (
  user: PostExtended["featuredUsers"][number],
) =>
  user.reviewsReceived.length
    ? user.reviewsReceived.reduce((sum, { rating }) => sum + rating, 0) /
      user.reviewsReceived.length
    : 1;

export const isUserInPostGroup = (
  post: Post & { featuredUsers: Partial<User>[] },
  userId: string,
) => post.featuredUsers.map((user) => user.id).includes(userId);

export const formatOrderBy = (orderByString: OrderBy) => {
  const [key, value] = orderByString.split("-");
  if (key && value) return { [key]: value };
  return undefined;
};
