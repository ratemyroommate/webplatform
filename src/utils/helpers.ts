import type { Post, User } from "@prisma/client";
import type { OrderBy } from "~/app/_components/Filters";

export const getAverageRating = (
  user?: PostExtended["featuredUsers"][number],
) =>
  user?.reviewsReceived?.length
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

export const locationOptions = [
  { value: "BUDAPEST", label: "Budapest" },
  { value: "DEBRECEN", label: "Debrecen" },
  { value: "SZEGED", label: "Szeged" },
];

export const getLocationLabel = (value: string | number) =>
  getSelectLabel(locationOptions, value);

const getSelectLabel = (
  options: { value: string | number; label: string }[],
  value: string | number,
) => {
  const match = options.find((option) => option.value === value);
  return match ? match.label : null;
};

export const ageOptions = [
  { value: 0, label: "Mindegy" },
  { value: 1, label: "18 - 24" },
  { value: 2, label: "25 - 34" },
  { value: 3, label: "35 - 44" },
  { value: 4, label: "45+" },
];

export const getAgeLabel = (value: number) => getSelectLabel(ageOptions, value);

export const genderOptions = [
  { value: 0, label: "Fiú és Lány" },
  { value: 1, label: "Csak Fiú" },
  { value: 2, label: "Csak Lány" },
];

export const getGenderLabel = (value: number) =>
  getSelectLabel(genderOptions, value);
