import { cn } from "~/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
};

/**
 * The RMRM wordmark — chunky lowercase + brand dot.
 * Driven by `size` (px); the dot scales at 20% of the wordmark.
 */
export function Logo({ size = 28, className }: LogoProps) {
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
        className="inline-block rounded-full bg-primary"
        style={{
          width: Math.max(5, size * 0.2),
          height: Math.max(5, size * 0.2),
          transform: "translateY(-1px)",
        }}
      />
    </span>
  );
}
