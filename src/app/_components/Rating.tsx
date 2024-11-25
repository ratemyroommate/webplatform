"use client";

type RatingProps = {
  itemKey: number | string;
  readOnly?: boolean;
  rating: number;
  isLarge?: boolean;
  onClick?: (rating: number) => void;
};

export const Rating = ({
  itemKey,
  readOnly,
  rating,
  isLarge,
  onClick,
}: RatingProps) => {
  return (
    <div className={isLarge ? "rating rating-md" : "rating rating-sm"}>
      {Array.from({ length: 5 }).map((_, index) => (
        <input
          key={index}
          type="radio"
          name={`rating-${itemKey}`}
          className="mask mask-star-2 bg-orange-400"
          readOnly={readOnly}
          checked={index === rating - 1}
          onChange={() => (onClick ? onClick(index + 1) : null)}
        />
      ))}
    </div>
  );
};
