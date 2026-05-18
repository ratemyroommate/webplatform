import { cn } from "~/lib/utils";

type LogoProps = {
  size?: number;
  /** CSS color for the brand dot. Defaults to `var(--primary)`. */
  accent?: string;
  className?: string;
};

/**
 * The RMRM wordmark — chunky lowercase + brand dot.
 * Driven by `size` (px); the dot scales at 20% of the wordmark.
 */
export function Logo({ size = 28, accent, className }: LogoProps) {
  return (
    <span
      className={cn("flex select-none items-baseline gap-[2px] text-foreground", className)}
    >
      <span
        style={{
          fontSize: size,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          lineHeight: 1,
        }}
      >
        rmrm
      </span>
      <span
        aria-hidden
        className="inline-block rounded-full"
        style={{
          width: Math.max(5, size * 0.2),
          height: Math.max(5, size * 0.2),
          background: accent ?? "var(--primary)",
          transform: "translateY(-1px)",
        }}
      />
    </span>
  );
}
