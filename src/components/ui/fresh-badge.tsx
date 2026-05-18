import { cn } from "~/lib/utils";

type FreshBadgeProps = {
  label: string;
  pulse?: boolean;
  className?: string;
};

export function FreshBadge({ label, pulse = true, className }: FreshBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2 py-1 text-[10px] leading-none font-extrabold uppercase tracking-wider text-primary-foreground",
        className
      )}
    >
      <span
        // Added translate-y-[0.5px] to optically align the dot with the cap-height of the text. 
        // If it needs to go higher instead of lower, change it to -translate-y-[0.5px]
        className={cn(
          "shrink-0 translate-y-[0.5px] h-1.5 w-1.5 rounded-full bg-current", 
          pulse && "animate-pulse"
        )}
      />
      {label}
    </span>
  );
}