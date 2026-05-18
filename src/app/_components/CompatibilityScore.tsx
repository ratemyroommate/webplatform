"use client";

import type { Session } from "next-auth";
import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "boneyard-js/react";
import { CompatScoreFixture } from "./skeleton-fixtures";
import { cn } from "~/lib/utils";

type CompatibilityScoreProps = {
  compareUserId: string;
  session: Session | null;
};

type Tone = "default" | "success" | "warning" | "error";

const toneClasses: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-white",
  error: "bg-destructive text-white",
};

export const CompatibilityScore = ({ compareUserId, session }: CompatibilityScoreProps) => {
  const t = useTranslations("compatibility");
  const { data, isLoading } = api.kviz.getStats.useQuery(compareUserId, {
    enabled: !!session?.user.id,
  });

  if (!session?.user.id || session.user.id === compareUserId) return;

  const isPending = isLoading || !data;

  return (
    <Skeleton
      name="compat-score"
      loading={isPending}
      animate="shimmer"
      fixture={<CompatScoreFixture />}
    >
      {data ? <Loaded data={data} t={t} /> : <CompatScoreFixture />}
    </Skeleton>
  );
};

type StatsData = {
  percentage: number;
  exactMatches: number;
  closeMatches: number;
  noMatches: number;
  completedQuestionCountByCurrentUser: number;
  completedQuestionCountByPostUser: number;
  totalQuestionCount: number;
};

const Loaded = ({
  data,
  t,
}: {
  data: StatsData;
  t: ReturnType<typeof useTranslations<"compatibility">>;
}) => {
  const { label, tone } = getButtonConfig(data.percentage, t);

  return (
    <Card className="p-4">
      {data.completedQuestionCountByCurrentUser === 0 && (
        <KvizCallToAction label={t("fillQuiz")} />
      )}

      {data.completedQuestionCountByCurrentUser > 0 &&
        data.completedQuestionCountByCurrentUser < data.totalQuestionCount && (
          <KvizCallToAction label={t("fillAll")} />
        )}

      {data.completedQuestionCountByPostUser === 0 && (
        <div className="text-sm">{t("otherNotCompleted")}</div>
      )}

      {data.completedQuestionCountByCurrentUser > 0 &&
        data.completedQuestionCountByPostUser > 0 && (
          <div className="flex">
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("quizBased")}
              </div>
              <div className="text-3xl font-bold">{data.percentage}%</div>
              <span
                className={cn(
                  "mt-1 inline-flex w-fit items-center rounded px-2 py-0.5 text-xs font-medium",
                  toneClasses[tone]
                )}
              >
                {label}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-end justify-between gap-1">
              <Badge className="bg-emerald-500 hover:bg-emerald-500">
                {t("exact", { count: data.exactMatches })}
              </Badge>
              <Badge className="bg-amber-500 hover:bg-amber-500">
                {t("close", { count: data.closeMatches })}
              </Badge>
              <Badge variant="destructive">{t("opposite", { count: data.noMatches })}</Badge>
            </div>
          </div>
        )}
    </Card>
  );
};

const getButtonConfig = (
  data: number | undefined,
  t: (key: string) => string
): { label: string; tone: Tone } => {
  if (data == null) {
    return { label: t("noData"), tone: "default" };
  }
  if (data < 50) return { label: t("notIdeal"), tone: "error" };
  if (data < 70) return { label: t("compatible"), tone: "warning" };
  return { label: t("perfectMatch"), tone: "success" };
};

const KvizCallToAction = ({ label }: { label: string }) => {
  const t = useTranslations("compatibility");
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm">{label}</div>
      <Button asChild size="sm" className="self-start">
        <Link href="/compatibility-kviz">{t("fillAction")}</Link>
      </Button>
    </div>
  );
};
