"use client";

import { AlertCircle, Check } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";
import { CompatRing } from "~/components/ui/compat-ring";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { OPEN_EDIT_PROFILE_EVENT } from "~/lib/events";

const FillQuizButton = ({ size = "sm", className }: { size?: "xs" | "sm"; className?: string }) => {
  const tc = useTranslations("common");
  return (
    <Button asChild variant="outline" size={size} className={className}>
      <Link href="/compatibility-kviz">{tc("fillQuiz")}</Link>
    </Button>
  );
};

export const ProfileCompleteness = ({ compact = false }: { compact?: boolean }) => {
  const { data, isLoading } = api.user.getProfileCompleteness.useQuery();
  const t = useTranslations("profile.completeness");

  if (isLoading || !data) return null;

  const { hasAbout, hasSocialLink, hasPhoneNumber, kvizAnswered, kvizTotal } = data;
  const kvizComplete = kvizTotal > 0 && kvizAnswered >= kvizTotal;

  type Item = {
    key: string;
    label: string;
    done: boolean;
    href?: string;
  };

  const items: Item[] = [
    { key: "about", label: t("introduction"), done: hasAbout },
    { key: "socialLink", label: t("socialLink"), done: hasSocialLink },
    { key: "phoneNumber", label: t("phoneNumber"), done: hasPhoneNumber },
    {
      key: "quiz",
      label: t("quiz", { answered: kvizAnswered, total: kvizTotal }),
      done: kvizComplete,
      href: "/compatibility-kviz",
    },
  ];

  const completed = items.filter((i) => i.done).length;
  const percentage = Math.round((completed / items.length) * 100);

  if (percentage === 100 && compact) return null;

  if (compact) {
    return (
      <div className="w-full">
        <div className="mb-1 flex w-full items-center justify-between gap-2">
          <span className="text-sm">{t("title")}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{percentage}%</span>
            {!kvizComplete && <FillQuizButton size="xs" />}
          </div>
        </div>
        <Progress value={percentage} className="w-full" />
      </div>
    );
  }

  const openEditProfile = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(OPEN_EDIT_PROFILE_EVENT));
  };

  return (
    <div className="rounded-3xl border border-[color:var(--ink-10)] bg-[var(--card)] p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-foreground text-[16px] font-semibold">{t("title")}</h2>
          <p className="mt-0.5 text-[12px] text-[color:var(--ink-60)]">{t("nudge")}</p>
        </div>
        <CompatRing value={percentage} size={56} stroke={4} />
      </div>

      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.key}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
              item.done ? "bg-[color:var(--accent-green-05)]" : "bg-[var(--background)]"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: item.done ? "var(--accent-green-hex)" : "var(--ink-10)",
                  color: item.done ? "var(--background)" : "var(--ink-60)",
                }}
              >
                {item.done ? (
                  <Check size={12} strokeWidth={2.5} />
                ) : (
                  <AlertCircle size={12} strokeWidth={2.25} />
                )}
              </span>
              <span
                className={cn(
                  "text-[13px]",
                  item.done
                    ? "text-[color:var(--ink-60)] line-through"
                    : "text-foreground font-medium"
                )}
              >
                {item.label}
              </span>
            </div>
            {!item.done &&
              (item.href ? (
                <Link
                  href={item.href}
                  className="text-primary whitespace-nowrap text-[12px] font-medium underline-offset-2 hover:underline"
                >
                  {t("add")} →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openEditProfile}
                  className="text-primary cursor-pointer whitespace-nowrap text-[12px] font-medium underline-offset-2 hover:underline"
                >
                  {t("add")} →
                </button>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
};
