import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

type CtaBannerProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
};

/**
 * Big primary CTA banner with leading icon, title + subtitle, trailing arrow.
 * Uses the same "chunky" offset shadow as the Button's chunky variant for visual
 * consistency. Built as a full-width button for primary screen-level CTAs.
 */
export function CtaBanner({ title, subtitle, icon: Icon, onClick, className }: CtaBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-3.5 text-left text-primary-foreground transition-all hover:brightness-95 active:translate-y-[1px]",
        "shadow-[0_1px_0_rgba(0,0,0,0.08),0_4px_0_color-mix(in_oklab,var(--primary)_75%,black)] active:shadow-[0_1px_0_rgba(0,0,0,0.08),0_2px_0_color-mix(in_oklab,var(--primary)_75%,black)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
            <Icon size={18} strokeWidth={2.5} />
          </span>
        )}
        <div>
          <div className="text-[14.5px] font-extrabold">{title}</div>
          {subtitle && <div className="text-[11.5px] font-medium opacity-85">{subtitle}</div>}
        </div>
      </div>
      <ArrowRight
        size={18}
        strokeWidth={2.5}
        className="transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}
