import { cn } from "~/lib/utils";

type CompatRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  className?: string;
};

/**
 * Circular percentage indicator. Color steps:
 *   >= 85 → accent green (high match)
 *   >= 70 → primary
 *   <  70 → muted ink
 */
export function CompatRing({
  value,
  size = 40,
  stroke = 3,
  showLabel = true,
  className,
}: CompatRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  const color =
    value >= 85
      ? "var(--accent-green-hex)"
      : value >= 70
        ? "var(--primary)"
        : "var(--ink-50)";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ink-10)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.22,.61,.36,1)" }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-medium tabular-nums text-foreground"
          style={{ fontSize: size * 0.3, letterSpacing: "-0.02em" }}
        >
          {value}
          <span style={{ fontSize: size * 0.18, opacity: 0.5, marginLeft: 1 }}>%</span>
        </span>
      )}
    </div>
  );
}
