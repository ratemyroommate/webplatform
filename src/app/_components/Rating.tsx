"use client";

import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

type RatingProps = {
  itemKey: number | string;
  readOnly?: boolean;
  rating: number;
  isLarge?: boolean;
  onClick?: (rating: number) => void;
};

export const Rating = ({ itemKey, readOnly, rating, isLarge, onClick }: RatingProps) => {
  const size = isLarge ? 28 : 14;
  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label={`rating-${itemKey}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const filled = value <= rating;
        return (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={filled}
            disabled={readOnly}
            onClick={() => onClick?.(value)}
            className={cn(
              "rounded-sm transition-transform",
              !readOnly && "cursor-pointer hover:scale-110",
              readOnly && "cursor-default"
            )}
          >
            <Star
              size={size}
              className={cn(
                filled
                  ? "fill-amber-400 stroke-amber-400"
                  : "stroke-muted-foreground fill-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
