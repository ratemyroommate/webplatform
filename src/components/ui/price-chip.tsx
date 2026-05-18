import { cn } from "~/lib/utils";

type PriceChipProps = {
  price: number;
  unit: string;
  className?: string;
};

/**
 * Floating white pill with a bold price + small unit. Designed for absolute-positioning
 * over a hero image (e.g. on PostCard's bottom-right).
 */
export function PriceChip({ price, unit, className }: PriceChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full bg-white px-3 py-1.5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
        className
      )}
    >
      <span className="text-[15px] font-extrabold tabular-nums">{price}k</span>
      <span className="text-[10.5px] font-medium text-muted-foreground">{unit}</span>
    </div>
  );
}
