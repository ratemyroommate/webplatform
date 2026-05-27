"use client";

import type { Session } from "next-auth";
import { useState } from "react";
import { Check } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "boneyard-js/react";
import { CompatScoreFixture } from "./skeleton-fixtures";
import { CategoryDonut } from "./CategoryDonut";
import { CATEGORY_META, type CategoryKey } from "~/utils/compatibility";
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
      {data ? <Loaded data={data} compareUserId={compareUserId} /> : <CompatScoreFixture />}
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
  categories: CategoryStats[];
};

type CategoryStats = {
  category: CategoryKey;
  percentage: number | null;
  score: number;
  max: number;
  exact: number;
  close: number;
  opposite: number;
  questionIds: number[];
};

const Loaded = ({ data, compareUserId }: { data: StatsData; compareUserId: string }) => {
  const t = useTranslations("compatibility");
  const { label, tone } = getButtonConfig(data.percentage, t);
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(null);

  const bothCompleted =
    data.completedQuestionCountByCurrentUser > 0 && data.completedQuestionCountByPostUser > 0;

  return (
    <Card className="flex flex-col gap-5 p-4">
      {data.completedQuestionCountByCurrentUser === 0 && <KvizCallToAction label={t("fillQuiz")} />}

      {data.completedQuestionCountByCurrentUser > 0 &&
        data.completedQuestionCountByCurrentUser < data.totalQuestionCount && (
          <KvizCallToAction label={t("fillAll")} />
        )}

      {data.completedQuestionCountByPostUser === 0 && (
        <div className="text-sm">{t("otherNotCompleted")}</div>
      )}

      {bothCompleted && (
        <>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("quizBased")}
              </div>
              <div className="text-3xl font-bold tabular-nums">{data.percentage}%</div>
              <span
                className={cn(
                  "mt-1 inline-flex w-fit items-center rounded px-2 py-0.5 text-xs font-medium",
                  toneClasses[tone]
                )}
              >
                {label}
              </span>
            </div>
            <div className="text-right text-[11px] text-[color:var(--ink-60)]">
              <div>{t("exact", { count: data.exactMatches })}</div>
              <div>{t("close", { count: data.closeMatches })}</div>
              <div>{t("opposite", { count: data.noMatches })}</div>
            </div>
          </div>

          {data.categories.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-[color:var(--ink-10)] pt-4">
              <div className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("matchByCategory")}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {data.categories.map((c) => {
                  const key = c.category;
                  const meta = CATEGORY_META[key];
                  if (!meta) return null;
                  const labelText = t(`categories.${meta.i18nKey}.label` as const);
                  const hasData = c.percentage !== null;
                  const pressed = openCategory === key;
                  return (
                    <CategoryDonut
                      key={key}
                      value={c.score}
                      max={c.max}
                      label={labelText}
                      centerText={hasData ? `${c.percentage}%` : "—"}
                      colorVar={meta.colorVar}
                      size="sm"
                      pressed={hasData ? pressed : undefined}
                      onClick={hasData ? () => setOpenCategory(pressed ? null : key) : undefined}
                      className={hasData ? undefined : "opacity-50"}
                    />
                  );
                })}
              </div>

              {openCategory ? (
                <CategoryDrillDown
                  category={openCategory}
                  questionIds={
                    data.categories.find((c) => c.category === openCategory)?.questionIds ?? []
                  }
                  compareUserId={compareUserId}
                />
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
};

const CategoryDrillDown = ({
  category,
  questionIds,
  compareUserId,
}: {
  category: CategoryKey;
  questionIds: number[];
  compareUserId: string;
}) => {
  const t = useTranslations("compatibility");
  const meta = CATEGORY_META[category];
  const { data, isLoading } = api.kviz.getPairAnswers.useQuery(
    { userId: compareUserId, questionIds },
    { enabled: questionIds.length > 0 }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-16 rounded-xl bg-[color:var(--ink-10)]" />
        <div className="h-16 rounded-xl bg-[color:var(--ink-10)]" />
      </div>
    );
  }
  if (!data || data.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-3"
      style={{ background: `var(${meta.colorVar}-soft)` }}
    >
      {data.map((question) => {
        const meAnswer = question.answers.find((a) =>
          a.submittedAnswers.some((s) => s.createdById !== compareUserId)
        );
        const otherAnswer = question.answers.find((a) =>
          a.submittedAnswers.some((s) => s.createdById === compareUserId)
        );
        return (
          <div
            key={question.id}
            className="bg-card flex flex-col gap-2 rounded-lg border border-[color:var(--ink-10)] p-3"
          >
            <div className="text-foreground text-[13px] font-bold">{question.text}</div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <AnswerCell
                role={t("viewerAnswered")}
                text={meAnswer?.text ?? t("noAnswerYet")}
                accent={`var(${meta.colorVar})`}
              />
              <AnswerCell
                role={t("otherAnswered")}
                text={otherAnswer?.text ?? t("noAnswerYet")}
                accent={`var(${meta.colorVar})`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AnswerCell = ({ role, text, accent }: { role: string; text: string; accent: string }) => (
  <div className="flex flex-col gap-1 rounded-md border border-[color:var(--ink-10)] bg-[var(--background)] p-2">
    <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: accent }}>
      {role}
    </span>
    <span className="flex items-start gap-1 text-[12px] text-[color:var(--ink-80)]">
      <Check size={12} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: accent }} />
      <span>{text}</span>
    </span>
  </div>
);

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
