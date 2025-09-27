"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { api } from "~/trpc/react";

type CompatibilityScoreProps = {
  compareUserId: string;
  session: Session | null;
};

export const CompatibilityScore = ({
  compareUserId,
  session,
}: CompatibilityScoreProps) => {
  const { data, isLoading } = api.kviz.getStats.useQuery(compareUserId, {
    enabled: !!session?.user.id,
  });

  if (!session?.user.id || session.user.id === compareUserId) return;
  const { label, color } = getButtonConfig(data?.percentage);

  return (
    <div className="stats bg-base-100 border-base-300 border">
      <div className="stat">
        {isLoading || !data ? (
          <Loading />
        ) : (
          <>
            {data.completedQuestionCountByCurrentUser === 0 && (
              <KvizCallToAction label="Töltsd ki a kvízt, hogy lásd mennyire vagytok kompatibilisak" />
            )}

            {data.completedQuestionCountByCurrentUser > 0 &&
              data.completedQuestionCountByCurrentUser <
                data.totalQuestionCount && (
                <KvizCallToAction label="Töltsd ki az összes kérdést pontosabb eredményért" />
              )}

            {data.completedQuestionCountByPostUser === 0 && (
              <div className="mb-3 text-sm">
                A poszt létrehozója nem töltötte ki a kvízt, kérlek nézz vissza
                később.
              </div>
            )}

            {data.completedQuestionCountByCurrentUser > 0 &&
              data.completedQuestionCountByPostUser > 0 && (
                <div className="flex">
                  <div className="flex flex-col">
                    <div className="stat-title">
                      Kompatibilitás kvíz alapján
                    </div>
                    <div className="stat-value">{data.percentage}%</div>
                    <div className="stat-actions">
                      <button className={`btn btn-xs btn-${color}`}>
                        {label}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col items-end justify-between">
                    <div className="btn btn-xs btn-success">
                      Egyező: {data.exactMatches}
                    </div>
                    <div className="btn btn-xs btn-warning">
                      Hasonló: {data.closeMatches}
                    </div>
                    <div className="btn btn-xs btn-error">
                      Ellentét: {data.noMatches}
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
const getButtonConfig = (data?: number) => {
  if (data == null) {
    return {
      label: "No data",
      color: "default",
    };
  }

  if (data < 50) {
    return {
      label: "Nem ideális",
      color: "error",
    };
  } else if (data < 70) {
    return {
      label: "Kompatibilis",
      color: "warning",
    };
  } else {
    return {
      label: "Tökéletes egyezés",
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

const KvizCallToAction = ({ label }: { label: string }) => (
  <div className="mb-3 flex flex-col gap-2">
    <div className="text-sm">{label}</div>
    <Link className="btn btn-sm btn-success" href="/compatibility-kviz">
      Kitöltöm
    </Link>
  </div>
);
