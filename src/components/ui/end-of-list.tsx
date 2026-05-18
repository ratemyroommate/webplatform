import { Sparkles, type LucideIcon } from "lucide-react";

type EndOfListProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
};

/**
 * Pastel "end of list" footer with circular icon disc and two-line copy.
 * Uses the accent-green tokens for a soft, consistent end-of-feed feel.
 */
export function EndOfList({ title, subtitle, icon: Icon = Sparkles, className }: EndOfListProps) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-3 py-10" + (className ? ` ${className}` : "")
      }
    >
      <span
        className="inline-flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "var(--accent-green-05)",
          color: "var(--accent-green-hex)",
        }}
      >
        <Icon size={22} strokeWidth={2.25} />
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-foreground text-[15px] font-semibold">{title}</p>
        {subtitle && <p className="text-[13px] text-[color:var(--ink-60)]">{subtitle}</p>}
      </div>
    </div>
  );
}
