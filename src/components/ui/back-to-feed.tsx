import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";

type BackToFeedProps = {
  className?: string;
};

/**
 * "← Back to feed" link rendered as a muted bold pill-style anchor.
 * Used as the top-of-page nav affordance on routes outside the main feed.
 */
export function BackToFeed({ className }: BackToFeedProps) {
  const t = useTranslations("common");
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-1.5 self-start whitespace-nowrap text-[12.5px] font-bold text-[color:var(--ink-60)] transition-colors hover:text-[color:var(--foreground)]",
        className
      )}
    >
      <ArrowLeft size={14} strokeWidth={2.25} />
      {t("backToFeed")}
    </Link>
  );
}
