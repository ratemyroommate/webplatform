"use client";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Skeleton } from "boneyard-js/react";
import { KvizQuestionFixture } from "./skeleton-fixtures";
import { CategoryDonut } from "./CategoryDonut";
import { KvizQuestionCard } from "./KvizQuestionCard";
import { CATEGORY_META, bucketFor } from "~/utils/compatibility";

type CompletedKvizProps = {
  userId?: string;
};

export const CompletedKviz = ({ userId }: CompletedKvizProps) => {
  const t = useTranslations("compatibility");
  const { data, isLoading } = api.kviz.getAnswers.useQuery(userId);
  const questions = data?.questions;
  const profile = data?.profile;

  return (
    <Skeleton
      name="kviz-question"
      loading={isLoading}
      animate="shimmer"
      fixture={<KvizQuestionFixture />}
    >
      <div className="flex flex-col gap-6">
        {profile?.some((p) => p.answered > 0) ? (
          <div className="bg-card flex flex-col gap-5 rounded-2xl border border-[color:var(--ink-10)] p-5">
            <h3
              className="text-foreground font-extrabold tracking-[-0.01em]"
              style={{ fontSize: 16 }}
            >
              {t("yourStyle")}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.map((cat) => {
                const meta = CATEGORY_META[cat.category];
                const bucket = bucketFor(cat.total, cat.max);
                const tCat = t(`categories.${meta.i18nKey}.label` as const);
                const tBucket = t(`categories.${meta.i18nKey}.bucket.${bucket}` as const);
                return (
                  <CategoryDonut
                    key={cat.category}
                    value={cat.total}
                    max={cat.max}
                    label={tCat}
                    centerText={tBucket}
                    centerSubText={`${cat.total}/${cat.max}`}
                    colorVar={meta.colorVar}
                  />
                );
              })}
            </div>
          </div>
        ) : null}

        {questions && questions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {questions.map((question) => {
              const selectedAnswerId =
                question.answers.find((a) => a.id === a.submittedAnswers[0]?.answerId)?.id ?? null;
              return (
                <KvizQuestionCard
                  key={question.id}
                  question={question}
                  selectedAnswerId={selectedAnswerId}
                  variant="review"
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </Skeleton>
  );
};
