"use client";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { api } from "~/trpc/react";
import { compatibilityKvizQuestions } from "~/utils/helpers";

export const Kviz = () => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );

  const utils = api.useUtils();
  const saveAnswerMutation = api.kviz.saveAnswer.useMutation({
    onSuccess: () => utils.kviz.getQuestionIndex.invalidate(),
  });

  const {
    data: questionIndex,
    isLoading,
    isRefetching,
  } = api.kviz.getQuestionIndex.useQuery();

  if (isLoading || isRefetching) return <LoadingKviz />;
  if (questionIndex === undefined) return "something went wrong";
  if (questionIndex === compatibilityKvizQuestions.length)
    return <CompletedKvizView />;
  const question = compatibilityKvizQuestions[questionIndex];
  if (!question) return <div>Nincs ilyen kerdes</div>;

  const handleSubmit = () => {
    if (selectedAnswerIndex === null) return;
    saveAnswerMutation.mutate({
      answerIndex: selectedAnswerIndex,
      questionIndex,
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
      <TimeLine questionIndex={questionIndex} />
      <div className="flex flex-col gap-4">
        <b className="rounded-lg text-2xl">{question.text}</b>
        <div className="join join-vertical">
          {question.answers.map((answer, index) => (
            <input
              key={index}
              className="join-item btn"
              type="radio"
              name="answer"
              aria-label={answer.text}
              value={index}
              onChange={() => setSelectedAnswerIndex(index)}
            />
          ))}
        </div>
      </div>
      <button
        disabled={saveAnswerMutation.isPending || selectedAnswerIndex === null}
        onClick={handleSubmit}
        className="btn btn-secondary w-1/2 self-end"
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

const TimeLine = ({ questionIndex }: { questionIndex: number }) => (
  <ul className="steps">
    {compatibilityKvizQuestions.map((_, index) => (
      <li
        key={index}
        className={`step ${questionIndex >= index ? "step-primary" : ""}`}
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
          {questions?.map((question, questionIndex) => (
            <div key={question.id} className="flex flex-col gap-4">
              <b className="rounded-lg text-2xl">
                {compatibilityKvizQuestions[question.questionIndex]?.text}
              </b>
              <div className="join join-vertical">
                {compatibilityKvizQuestions[
                  question.questionIndex
                ]?.answers.map((answer, index) => (
                  <input
                    key={index}
                    className="join-item btn"
                    type="radio"
                    name={`question-${question.id}`}
                    aria-label={answer.text}
                    value={question.id + index}
                    readOnly
                    checked={
                      question.answerIndex !== null &&
                      index === question.answerIndex &&
                      questionIndex === question.questionIndex
                    }
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
