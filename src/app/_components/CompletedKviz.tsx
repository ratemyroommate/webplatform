"use client";
import { api } from "~/trpc/react";
import { LoadingQuestion } from "./Kviz";

type CompletedKvizProps = {
  userId?: string;
};

export const CompletedKviz = ({ userId }: CompletedKvizProps) => {
  const { data: questions, isLoading } = api.kviz.getAnsers.useQuery(userId);
  if (isLoading) return <LoadingAnswers />;
  return (
    <div className="flex flex-col gap-6">
      {questions?.map((question) => (
        <div key={question.id} className="flex flex-col gap-4">
          <b className="rounded-lg text-2xl">{question.text}</b>
          <div className="join join-vertical">
            {question.answers.map((answer, index) => (
              <input
                key={index}
                className="join-item btn h-auto p-4 text-left"
                type="radio"
                name={`question-${question.id}`}
                aria-label={answer.text}
                value={question.id + answer.id}
                readOnly
                checked={answer.id === answer.submittedAnswers[0]?.answerId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const LoadingAnswers = () => (
  <>
    <LoadingQuestion />
    <LoadingQuestion />
  </>
);
