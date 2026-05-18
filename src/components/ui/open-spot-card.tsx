import { Plus } from "lucide-react";
import { cn } from "~/lib/utils";

type OpenSpotCardProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

/**
 * Dashed primary-bordered card used in roommates grids to represent an open slot.
 * Visually mirrors the rectangular "RoommateCard" but signals invitation.
 */
export function OpenSpotCard({ title, subtitle, className }: OpenSpotCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center rounded-2xl border-2 border-dashed p-4",
        className
      )}
      style={{
        borderColor: "var(--primary-30)",
        background: "var(--primary-05)",
      }}
    >
      <div
        className="inline-flex h-12 w-12 items-center justify-center rounded-full text-primary"
        style={{ background: "var(--primary-15)" }}
      >
        <Plus size={20} strokeWidth={2} />
      </div>
      <div className="mt-3 whitespace-nowrap text-[13.5px] font-semibold leading-tight text-primary">
        {title}
      </div>
      {subtitle && (
        <div className="mt-1 whitespace-nowrap text-[11.5px] text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
}
