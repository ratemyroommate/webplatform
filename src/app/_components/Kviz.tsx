"use client";
import { ArrowRight, Home, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { CompletedKviz } from "./CompletedKviz";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export const Kviz = () => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const t = useTranslations("kviz");

  const utils = api.useUtils();
  const saveAnswerMutation = api.kviz.saveAnswer.useMutation({
    onSuccess: () => {
      void utils.kviz.getQuestion.invalidate();
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
    <>
      <Accordion type="single" collapsible className="rounded-md border px-4">
        <AccordionItem value="intro" className="border-0">
          <AccordionTrigger className="font-semibold">{t("title")}</AccordionTrigger>
          <AccordionContent
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: t.raw("description") as string }}
          />
        </AccordionItem>
      </Accordion>
      <TimeLine questionIndex={questionIndex} totalQuestionCount={totalQuestionCount} />
      <div className="flex flex-col gap-4">
        <b className="rounded-lg text-2xl">{question.text}</b>
        <RadioGroup
          value={selectedAnswerId !== null ? String(selectedAnswerId) : undefined}
          onValueChange={(v) => setSelectedAnswerId(Number(v))}
          className="flex flex-col gap-2"
        >
          {question.answers.map((answer) => (
            <Label
              key={answer.id}
              className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md border p-4"
            >
              <RadioGroupItem value={String(answer.id)} />
              <span>{answer.text}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
      <Button
        disabled={saveAnswerMutation.isPending || selectedAnswerId === null}
        onClick={handleSubmit}
        className="self-end"
      >
        {t("saveAndNext")}
        <ArrowRight />
      </Button>
    </>
  );
};

const LoadingKviz = () => (
  <>
    <Skeleton className="h-16" />
    <Skeleton className="my-4 h-2 w-2/3 self-center" />
    <LoadingQuestion />
    <Skeleton className="h-8 w-1/2 self-end" />
  </>
);

const TimeLine = ({
  questionIndex,
  totalQuestionCount,
}: {
  questionIndex: number;
  totalQuestionCount: number;
}) => (
  <div className="flex w-full items-center gap-1 py-2">
    {Array.from({ length: totalQuestionCount }).map((_, index) => (
      <div
        key={index}
        className={cn(
          "h-1.5 flex-1 rounded-full transition-colors",
          questionIndex >= index ? "bg-primary" : "bg-muted"
        )}
      />
    ))}
  </div>
);

export const LoadingQuestion = () => (
  <>
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-6" />
    <Skeleton className="h-6" />
    <Skeleton className="h-6" />
  </>
);

const CompletedKvizView = () => {
  const t = useTranslations("kviz");
  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>{t("completed")}</AlertTitle>
      </Alert>
      <CompletedKviz />
      <Button asChild className="self-end">
        <Link href="/">
          <Home />
          Vissza a főoldalra
        </Link>
      </Button>
    </div>
  );
};
