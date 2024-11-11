"use client";

type RatingProps = {
  itemKey: number;
  readOnly?: boolean;
  rating: number;
  size?: string;
  onClick?: (rating: number) => void;
};

export const Rating = ({
  itemKey,
  readOnly,
  rating,
  size = "sm",
  onClick,
}: RatingProps) => {
  return (
    <div className={`rating rating-${size}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <input
          key={index}
          type="radio"
          name={`rating-${itemKey}`}
          className="mask mask-star-2 bg-orange-400"
          readOnly={readOnly}
          defaultChecked={index === rating - 1}
          onClick={() => (onClick ? onClick(index + 1) : null)}
        />
      ))}
    </div>
  );
};
