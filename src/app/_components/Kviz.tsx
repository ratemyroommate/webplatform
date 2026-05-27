"use client";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { CompletedKviz } from "./CompletedKviz";
import { KvizQuestionCard } from "./KvizQuestionCard";
import { Button } from "~/components/ui/button";
import { Skeleton } from "boneyard-js/react";
import { KvizQuestionFixture } from "./skeleton-fixtures";
import { cn } from "~/lib/utils";

export const Kviz = () => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const t = useTranslations("kviz");

  const utils = api.useUtils();
  const saveAnswerMutation = api.kviz.saveAnswer.useMutation({
    onSuccess: () => {
      setSelectedAnswerId(null);
      void utils.kviz.getQuestion.invalidate();
      void utils.kviz.getStats.invalidate();
      void utils.kviz.getAnswers.invalidate();
      void utils.kviz.getCurrentUserAnswerCount.invalidate();
      void utils.user.getProfileCompleteness.invalidate();
    },
  });

  const { data, isLoading, isRefetching } = api.kviz.getQuestion.useQuery();
  const isPending = isLoading || isRefetching || !data;

  const handleSubmit = () => {
    if (selectedAnswerId === null || !data?.question) return;
    saveAnswerMutation.mutate({
      answerId: selectedAnswerId,
      questionId: data.question.id,
    });
  };

  return (
    <Skeleton
      name="kviz-question"
      loading={isPending}
      animate="shimmer"
      fixture={<KvizQuestionFixture />}
    >
      {data && !data.question ? (
        <CompletedKvizView />
      ) : data?.question ? (
        <div className="flex flex-col gap-6">
          <TimeLine
            questionIndex={data.questionIndex}
            totalQuestionCount={data.totalQuestionCount}
          />

          <KvizQuestionCard
            question={data.question}
            selectedAnswerId={selectedAnswerId}
            onSelect={setSelectedAnswerId}
            variant="active"
          />

          <Button
            variant="chunky"
            disabled={saveAnswerMutation.isPending || selectedAnswerId === null}
            onClick={handleSubmit}
            className="self-end px-6"
          >
            {t("saveAndNext")}
            <ArrowRight />
          </Button>
        </div>
      ) : (
        <KvizQuestionFixture />
      )}
    </Skeleton>
  );
};

const TimeLine = ({
  questionIndex,
  totalQuestionCount,
}: {
  questionIndex: number;
  totalQuestionCount: number;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between text-[12px] font-bold tracking-wider text-[color:var(--ink-60)] uppercase">
      <span>
        {questionIndex + 1} / {totalQuestionCount}
      </span>
      <span className="tabular-nums">
        {Math.round(((questionIndex + 1) / totalQuestionCount) * 100)}%
      </span>
    </div>
    <div className="flex w-full items-center gap-1">
      {Array.from({ length: totalQuestionCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            questionIndex >= index ? "bg-primary" : "bg-[color:var(--ink-10)]"
          )}
        />
      ))}
    </div>
  </div>
);

const CompletedKvizView = () => {
  const t = useTranslations("kviz");
  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex items-center gap-3 rounded-2xl border p-4"
        style={{
          borderColor: "var(--accent-green-hex)",
          background: "var(--accent-green-05)",
        }}
      >
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--accent-green-hex)", color: "var(--background)" }}
        >
          <Check size={16} strokeWidth={2.5} />
        </span>
        <span className="text-[14px] font-bold" style={{ color: "var(--accent-green-hex)" }}>
          {t("completed")}
        </span>
      </div>
      <CompletedKviz />
    </div>
  );
};
