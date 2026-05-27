"use client";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { CATEGORY_META, type CategoryKey } from "~/utils/compatibility";
import { cn } from "~/lib/utils";

type AnswerOption = {
  id: number;
  text: string;
};

type KvizQuestionCardProps = {
  question: {
    id: number;
    text: string;
    category: CategoryKey;
    answers: AnswerOption[];
  };
  /** Currently selected answer id (controlled). */
  selectedAnswerId: number | null;
  /**
   * When provided, the card is interactive: answers render as buttons and call
   * `onSelect` when clicked. When omitted, answers render as static rows
   * (readonly review mode).
   */
  onSelect?: (answerId: number) => void;
  /** `"active"` = larger heading + padding for the live quiz. `"review"` = compact. */
  variant?: "active" | "review";
};

export const KvizQuestionCard = ({
  question,
  selectedAnswerId,
  onSelect,
  variant = "active",
}: KvizQuestionCardProps) => {
  const isInteractive = !!onSelect;
  const meta = CATEGORY_META[question.category];
  const isActive = variant === "active";

  return (
    <div
      className={cn(
        "bg-card flex flex-col rounded-2xl border",
        isActive ? "gap-5 p-6" : "gap-4 p-5"
      )}
      style={{
        borderColor: meta ? `var(${meta.colorVar}-soft)` : "var(--ink-10)",
      }}
    >
      <CategoryChip category={question.category} />

      {isActive ? (
        <h2
          className="text-foreground font-extrabold tracking-[-0.015em]"
          style={{ fontSize: 22, lineHeight: 1.25 }}
        >
          {question.text}
        </h2>
      ) : (
        <h3
          className="text-foreground font-extrabold tracking-[-0.01em]"
          style={{ fontSize: 17, lineHeight: 1.3 }}
        >
          {question.text}
        </h3>
      )}

      <div className="flex flex-col gap-2">
        {question.answers.map((answer) => (
          <AnswerRow
            key={answer.id}
            answer={answer}
            isSelected={selectedAnswerId === answer.id}
            onSelect={onSelect}
            isInteractive={isInteractive}
            isActive={isActive}
          />
        ))}
      </div>
    </div>
  );
};

type AnswerRowProps = {
  answer: AnswerOption;
  isSelected: boolean;
  onSelect?: (answerId: number) => void;
  isInteractive: boolean;
  isActive: boolean;
};

const AnswerRow = ({ answer, isSelected, onSelect, isInteractive, isActive }: AnswerRowProps) => {
  const selectedClasses = "border-primary text-foreground bg-[var(--primary-05)]";
  const baseUnselected = "border-[color:var(--ink-10)] bg-[var(--background)]";

  const indicator = (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
        isInteractive && "transition-colors",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : cn("border-[color:var(--ink-30)]", isInteractive && "bg-transparent")
      )}
    >
      {isSelected && <Check size={12} strokeWidth={3} />}
    </span>
  );

  if (isInteractive && onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(answer.id)}
        aria-pressed={isSelected}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[14px] transition-all",
          isSelected
            ? selectedClasses
            : cn(baseUnselected, "text-[color:var(--ink-80)] hover:border-[color:var(--ink-30)]")
        )}
      >
        {indicator}
        <span className="font-medium">{answer.text}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border text-[13.5px]",
        isActive ? "p-4" : "p-3.5",
        isSelected ? selectedClasses : cn(baseUnselected, "text-[color:var(--ink-60)]")
      )}
    >
      {indicator}
      <span className={isSelected ? "font-medium" : ""}>{answer.text}</span>
    </div>
  );
};

export const CategoryChip = ({ category }: { category: CategoryKey }) => {
  const meta = CATEGORY_META[category];
  const t = useTranslations("compatibility");
  if (!meta) return null;
  return (
    <span
      className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase"
      style={{
        background: `var(${meta.colorVar}-soft)`,
        color: `var(${meta.colorVar})`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(${meta.colorVar})` }} />
      {t(`categories.${meta.i18nKey}.label` as const)}
    </span>
  );
};
