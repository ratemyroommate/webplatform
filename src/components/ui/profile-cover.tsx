import { cn } from "~/lib/utils";

type ProfileCoverProps = {
  height?: number;
  className?: string;
};

/**
 * Primary-gradient banner used at the top of profile cards.
 * Includes a soft radial overlay for depth.
 */
export function ProfileCover({ height = 140, className }: ProfileCoverProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        height,
        background:
          "linear-gradient(135deg, var(--primary-15), var(--primary-30) 80%, var(--primary))",
      }}
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,.4) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(0,0,0,.2) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
