"use client";
import { ArrowRight, Check, Home } from "lucide-react";
import { useState } from "react";
import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/react";
import { CompletedKviz } from "./CompletedKviz";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
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
      void utils.kviz.getAnsers.invalidate();
      void utils.kviz.getCurrentUserAnswerCount.invalidate();
      void utils.user.getProfileCompleteness.invalidate();
    },
  });

  const { data, isLoading, isRefetching } = api.kviz.getQuestion.useQuery();
  if (isLoading || isRefetching || !data) return <LoadingKviz />;

  const { question, questionIndex, totalQuestionCount } = data;
  if (!question) return <CompletedKvizView />;

  const handleSubmit = () => {
    if (selectedAnswerId === null) return;
    saveAnswerMutation.mutate({
      answerId: selectedAnswerId,
      questionId: question.id,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <TimeLine questionIndex={questionIndex} totalQuestionCount={totalQuestionCount} />

      <div className="bg-card flex flex-col gap-5 rounded-2xl border border-[color:var(--ink-10)] p-6">
        <h2
          className="text-foreground font-extrabold tracking-[-0.015em]"
          style={{ fontSize: 22, lineHeight: 1.25 }}
        >
          {question.text}
        </h2>

        <div className="flex flex-col gap-2">
          {question.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <button
                key={answer.id}
                type="button"
                onClick={() => setSelectedAnswerId(answer.id)}
                aria-pressed={isSelected}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[14px] transition-all",
                  isSelected
                    ? "border-primary bg-[var(--primary-05)] text-foreground"
                    : "border-[color:var(--ink-10)] bg-[var(--background)] text-[color:var(--ink-80)] hover:border-[color:var(--ink-30)]"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-[color:var(--ink-30)] bg-transparent"
                  )}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="font-medium">{answer.text}</span>
              </button>
            );
          })}
        </div>
      </div>

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
  );
};

const LoadingKviz = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-1.5 w-full" />
    <div className="bg-card flex flex-col gap-5 rounded-2xl border border-[color:var(--ink-10)] p-6">
      <Skeleton className="h-6 w-2/3" />
      <LoadingQuestion />
    </div>
    <Skeleton className="h-10 w-40 self-end" />
  </div>
);

const TimeLine = ({
  questionIndex,
  totalQuestionCount,
}: {
  questionIndex: number;
  totalQuestionCount: number;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between text-[12px] font-bold uppercase tracking-wider text-[color:var(--ink-60)]">
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

export const LoadingQuestion = () => (
  <>
    <Skeleton className="h-12" />
    <Skeleton className="h-12" />
    <Skeleton className="h-12" />
  </>
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
        <span
          className="text-[14px] font-bold"
          style={{ color: "var(--accent-green-hex)" }}
        >
          {t("completed")}
        </span>
      </div>
      <CompletedKviz />
    </div>
  );
};
