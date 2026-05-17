"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";

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

  const items = [
    { label: t("introduction"), done: hasAbout },
    { label: t("socialLink"), done: hasSocialLink },
    { label: t("phoneNumber"), done: hasPhoneNumber },
    {
      label: t("quiz", { answered: kvizAnswered, total: kvizTotal }),
      done: kvizComplete,
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

  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("title")}</h3>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} className="w-full" />
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CheckCircle2 className="text-primary h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <span className={item.done ? "line-through opacity-60" : ""}>{item.label}</span>
          </li>
        ))}
      </ul>
      {!kvizComplete && <FillQuizButton className="self-start" />}
    </Card>
  );
};
