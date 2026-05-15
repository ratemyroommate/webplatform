"use client";
import { api } from "~/trpc/react";
import { LoadingQuestion } from "./Kviz";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";

type CompletedKvizProps = {
  userId?: string;
};

export const CompletedKviz = ({ userId }: CompletedKvizProps) => {
  const { data: questions, isLoading } = api.kviz.getAnsers.useQuery(userId);
  if (isLoading) return <LoadingAnswers />;
  return (
    <div className="flex flex-col gap-6">
      {questions?.map((question) => {
        const selectedAnswerId = question.answers.find(
          (a) => a.id === a.submittedAnswers[0]?.answerId
        )?.id;
        return (
          <div key={question.id} className="flex flex-col gap-3">
            <b className="rounded-lg text-2xl">{question.text}</b>
            <RadioGroup
              value={selectedAnswerId ? String(selectedAnswerId) : undefined}
              className="flex flex-col gap-2"
            >
              {question.answers.map((answer) => (
                <Label key={answer.id} className="flex items-center gap-3 rounded-md border p-4">
                  <RadioGroupItem value={String(answer.id)} disabled />
                  <span>{answer.text}</span>
                </Label>
              ))}
            </RadioGroup>
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
