"use client";
import { Check } from "lucide-react";
import { api } from "~/trpc/react";
import { LoadingQuestion } from "./Kviz";
import { cn } from "~/lib/utils";

type CompletedKvizProps = {
  userId?: string;
};

export const CompletedKviz = ({ userId }: CompletedKvizProps) => {
  const { data: questions, isLoading } = api.kviz.getAnsers.useQuery(userId);
  if (isLoading) return <LoadingAnswers />;
  return (
    <div className="flex flex-col gap-4">
      {questions?.map((question) => {
        const selectedAnswerId = question.answers.find(
          (a) => a.id === a.submittedAnswers[0]?.answerId
        )?.id;
        return (
          <div
            key={question.id}
            className="bg-card flex flex-col gap-4 rounded-2xl border border-[color:var(--ink-10)] p-5"
          >
            <h3
              className="text-foreground font-extrabold tracking-[-0.01em]"
              style={{ fontSize: 18, lineHeight: 1.3 }}
            >
              {question.text}
            </h3>
            <div className="flex flex-col gap-2">
              {question.answers.map((answer) => {
                const isSelected = selectedAnswerId === answer.id;
                return (
                  <div
                    key={answer.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3.5 text-[13.5px]",
                      isSelected
                        ? "border-primary bg-[var(--primary-05)] text-foreground"
                        : "border-[color:var(--ink-10)] bg-[var(--background)] text-[color:var(--ink-60)]"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-[color:var(--ink-30)]"
                      )}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className={isSelected ? "font-medium" : ""}>{answer.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LoadingAnswers = () => (
  <>
    <LoadingQuestion />
    <LoadingQuestion />
  </>
);
