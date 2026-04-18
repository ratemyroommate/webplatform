"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";

type CompatibilityScoreProps = {
  compareUserId: string;
  session: Session | null;
};

export const CompatibilityScore = ({ compareUserId, session }: CompatibilityScoreProps) => {
  const t = useTranslations("compatibility");
  const { data, isLoading } = api.kviz.getStats.useQuery(compareUserId, {
    enabled: !!session?.user.id,
  });

  if (!session?.user.id || session.user.id === compareUserId) return;
  const { label, color } = getButtonConfig(data?.percentage, t);

  return (
    <div className="stats bg-base-100 border-base-300 border">
      <div className="stat">
        {isLoading || !data ? (
          <Loading />
        ) : (
          <>
            {data.completedQuestionCountByCurrentUser === 0 && (
              <KvizCallToAction label={t("fillQuiz")} />
            )}

            {data.completedQuestionCountByCurrentUser > 0 &&
              data.completedQuestionCountByCurrentUser < data.totalQuestionCount && (
                <KvizCallToAction label={t("fillAll")} />
              )}

            {data.completedQuestionCountByPostUser === 0 && (
              <div className="mb-3 text-sm">{t("otherNotCompleted")}</div>
            )}

            {data.completedQuestionCountByCurrentUser > 0 &&
              data.completedQuestionCountByPostUser > 0 && (
                <div className="flex">
                  <div className="flex flex-col">
                    <div className="stat-title">{t("quizBased")}</div>
                    <div className="stat-value">{data.percentage}%</div>
                    <div className="stat-actions">
                      <button className={`btn btn-xs btn-${color}`}>{label}</button>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col items-end justify-between">
                    <div className="btn btn-xs btn-success">
                      {t("exact", { count: data.exactMatches })}
                    </div>
                    <div className="btn btn-xs btn-warning">
                      {t("close", { count: data.closeMatches })}
                    </div>
                    <div className="btn btn-xs btn-error">
                      {t("opposite", { count: data.noMatches })}
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};
const getButtonConfig = (data: number | undefined, t: (key: string) => string) => {
  if (data == null) {
    return {
      label: t("noData"),
      color: "default",
    };
  }

  if (data < 50) {
    return {
      label: t("notIdeal"),
      color: "error",
    };
  } else if (data < 70) {
    return {
      label: t("compatible"),
      color: "warning",
    };
  } else {
    return {
      label: t("perfectMatch"),
      color: "success",
    };
  }
};

const Loading = () => (
  <div className="flex">
    <div className="flex flex-grow flex-col gap-2">
      <div className="skeleton h-4"></div>
      <div className="skeleton h-9 w-1/2"></div>
      <div className="skeleton h-6 w-2/3"></div>
    </div>
    <div className="flex flex-1 flex-col items-end justify-between">
      <div className="skeleton h-6 w-1/2"></div>
      <div className="skeleton h-6 w-1/2"></div>
      <div className="skeleton h-6 w-1/2"></div>
    </div>
  </div>
);

const KvizCallToAction = ({ label }: { label: string }) => {
  const t = useTranslations("compatibility");
  return (
    <div className="mb-3 flex flex-col gap-2">
      <div className="text-sm">{label}</div>
      <Link className="btn btn-sm btn-success" href="/compatibility-kviz">
        {t("fillAction")}
      </Link>
    </div>
  );
};
