"use client";

import { AlertCircle, Check } from "lucide-react";
import type { User } from "@prisma/client";
import { useState } from "react";
import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";
import { CompatRing } from "~/components/ui/compat-ring";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { EditProfile } from "~/app/_components/EditProfile";

/**
 * Compact completeness bar shown on the feed page. Read-only: links to the
 * quiz when needed but cannot open the EditProfile dialog — that lives on
 * the user's profile page only.
 */
export const CompactProfileCompleteness = () => {
  const { data, isLoading } = api.user.getProfileCompleteness.useQuery();
  const t = useTranslations("profile.completeness");
  const tc = useTranslations("common");

  if (isLoading || !data) return null;

  const { hasAbout, hasSocialLink, hasPhoneNumber, kvizAnswered, kvizTotal } = data;
  const kvizComplete = kvizTotal > 0 && kvizAnswered >= kvizTotal;
  const flags = [hasAbout, hasSocialLink, hasPhoneNumber, kvizComplete];
  const percentage = Math.round((flags.filter(Boolean).length / flags.length) * 100);

  if (percentage === 100) return null;

  return (
    <div className="w-full">
      <div className="mb-1 flex w-full items-center justify-between gap-2">
        <span className="text-sm">{t("title")}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{percentage}%</span>
          {!kvizComplete && (
            <Button asChild variant="outline" size="xs">
              <Link href="/compatibility-kviz">{tc("fillQuiz")}</Link>
            </Button>
          )}
        </div>
      </div>
      <Progress value={percentage} className="w-full" />
    </div>
  );
};

/**
 * Full completeness checklist shown on the owner's profile page. Owns its
 * own controlled EditProfile dialog so the inline "fix" buttons open the
 * editor directly — no shared state, no events.
 */
export const ProfileCompleteness = ({ user }: { user: User }) => {
  const { data, isLoading } = api.user.getProfileCompleteness.useQuery();
  const t = useTranslations("profile.completeness");
  const [editOpen, setEditOpen] = useState(false);

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
                  className="text-primary text-[12px] font-medium whitespace-nowrap underline-offset-2 hover:underline"
                >
                  {t("add")} →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="text-primary cursor-pointer text-[12px] font-medium whitespace-nowrap underline-offset-2 hover:underline"
                >
                  {t("add")} →
                </button>
              ))}
          </li>
        ))}
      </ul>

      <EditProfile {...user} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
};
