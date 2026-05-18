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
      className={cn("flex flex-col gap-2 rounded-xl border-2 border-dashed p-4", className)}
      style={{
        borderColor: "var(--primary-30)",
        background: "var(--primary-05)",
      }}
    >
      <div
        className="text-primary inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--primary-15)" }}
      >
        <Plus size={20} strokeWidth={2} />
      </div>
      <div className="text-primary text-[13.5px] leading-tight font-semibold whitespace-nowrap">
        {title}
      </div>
      {subtitle && (
        <div className="text-muted-foreground text-[11.5px] whitespace-nowrap">{subtitle}</div>
      )}
    </div>
  );
}
