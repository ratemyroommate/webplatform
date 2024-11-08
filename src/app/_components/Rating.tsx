type RatingProps = {
  itemKey: number;
  readOnly?: boolean;
  rating: number;
};

export const Rating = ({ itemKey, readOnly, rating }: RatingProps) => {
  return (
    <div className="rating rating-sm">
      {Array.from({ length: 5 }).map((_, index) => (
        <input
          key={index}
          type="radio"
          name={`rating-${itemKey}`}
          className="mask mask-star-2 bg-orange-400"
          readOnly={readOnly}
          defaultChecked={index === rating - 1}
        />
      ))}
    </div>
  );
};
