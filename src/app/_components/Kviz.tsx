"use client";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { api } from "~/trpc/react";

export const Kviz = () => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);

  const utils = api.useUtils();
  const saveAnswerMutation = api.kviz.saveAnswer.useMutation({
    onSuccess: () => utils.kviz.getQuestion.invalidate(),
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
    <>
      <div className="collapse-arrow bg-base-100 border-base-300 collapse border">
        <input type="radio" name="my-accordion-2" />
        <div className="collapse-title font-semibold">Kompatibilitás Kviz</div>
        <div className="collapse-content text-sm">
          Minden kérdésre <b>egyszer</b> lehet válaszolni, nincs módosítási
          lehetőség. Továbblépés után minden válasz mentésre kerül.
        </div>
      </div>
      <TimeLine
        questionIndex={questionIndex}
        totalQuestionCount={totalQuestionCount}
      />
      <div className="flex flex-col gap-4">
        <b className="rounded-lg text-2xl">{question.text}</b>
        <div className="join join-vertical">
          {question.answers.map((answer) => (
            <input
              key={answer.id}
              className="join-item btn h-auto p-4 text-left"
              type="radio"
              name="answer"
              aria-label={answer.text}
              value={answer.id}
              onChange={() => setSelectedAnswerId(answer.id)}
            />
          ))}
        </div>
      </div>
      <button
        disabled={saveAnswerMutation.isPending || selectedAnswerId === null}
        onClick={handleSubmit}
        className="btn btn-secondary self-end"
      >
        Mentés és Tovább
        <ArrowRightIcon width={16} />
      </button>
    </>
  );
};

const LoadingKviz = () => (
  <>
    <div className="skeleton h-16"></div>
    <div className="skeleton my-4 h-2 w-2/3 self-center"></div>
    <LoadingQuestion />
    <div className="skeleton h-8 w-1/2 self-end"></div>
  </>
);

const TimeLine = ({
  questionIndex,
  totalQuestionCount,
}: {
  questionIndex: number;
  totalQuestionCount: number;
}) => (
  <ul className="steps">
    {Array.from({ length: totalQuestionCount }).map((_, index) => (
      <li
        key={index}
        className={`step !min-w-auto ${questionIndex >= index ? "step-primary" : ""}`}
      ></li>
    ))}
  </ul>
);

const CompletedKvizView = () => {
  const { data: questions, isLoading } = api.kviz.getAnsers.useQuery();
  return (
    <div className="flex flex-col gap-6">
      <div role="alert" className="alert alert-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>A kvíz sikeresen ki lett töltve.</span>
      </div>
      {isLoading ? (
        <LoadingAnswers />
      ) : (
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
      )}
    </div>
  );
};

const LoadingAnswers = () => (
  <>
    <LoadingQuestion />
    <LoadingQuestion />
  </>
);

const LoadingQuestion = () => (
  <>
    <div className="skeleton h-4 w-1/2"></div>
    <div className="skeleton h-4 w-1/2"></div>

    <div className="skeleton h-6"></div>
    <div className="skeleton h-6"></div>
    <div className="skeleton h-6"></div>
  </>
);
