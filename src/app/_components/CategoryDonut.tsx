"use client";

import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

type Size = "sm" | "md";

type CategoryDonutProps = {
  /** Filled portion (0..max) */
  value: number;
  /** Maximum value (defines 100% fill) */
  max: number;
  /** Visible label below the donut (e.g. category name) */
  label: string;
  /** Text rendered inside the donut (e.g. "Balanced" or "78%") */
  centerText: string;
  /** Optional secondary text below the centerText (smaller) */
  centerSubText?: string;
  /** CSS variable name for the stroke color, e.g. "--category-lifestyle" */
  colorVar: string;
  /** Visual size variant (default `md`) */
  size?: Size;
  /** Click handler — turns the donut into a button when provided */
  onClick?: () => void;
  /** Aria-pressed for toggle buttons */
  pressed?: boolean;
  className?: string;
};

/**
 * `box`/`stroke` are SVG viewBox units (fixed proportions). The rendered pixel
 * size is driven by Tailwind classes so the donut shrinks on mobile but keeps
 * its desktop look on `sm:` and up.
 */
const SIZES: Record<
  Size,
  { box: number; stroke: number; sizeClass: string; centerClass: string; subClass: string }
> = {
  sm: {
    box: 88,
    stroke: 9,
    sizeClass: "h-[60px] w-[60px] sm:h-[88px] sm:w-[88px]",
    centerClass: "text-[9px] sm:text-[13px]",
    subClass: "text-[7px] sm:text-[10px]",
  },
  md: {
    box: 132,
    stroke: 12,
    sizeClass: "h-[84px] w-[84px] sm:h-[132px] sm:w-[132px]",
    centerClass: "text-[10px] sm:text-[17px]",
    subClass: "text-[8px] sm:text-[11px]",
  },
};

const FILL_TRANSITION = "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)";

const clampRatio = (value: number, max: number) =>
  max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));

export const CategoryDonut = ({
  value,
  max,
  label,
  centerText,
  centerSubText,
  colorVar,
  size = "md",
  onClick,
  pressed,
  className,
}: CategoryDonutProps) => {
  const { box, stroke, sizeClass, centerClass, subClass } = SIZES[size];
  const ratio = clampRatio(value, max);
  const isInteractive = !!onClick;
  const Wrapper = isInteractive ? "button" : "div";

  return (
    <Wrapper
      type={isInteractive ? "button" : undefined}
      onClick={onClick}
      aria-pressed={isInteractive ? pressed : undefined}
      className={cn(
        "flex flex-col items-center gap-2 text-center",
        isInteractive &&
          "cursor-pointer rounded-2xl p-1 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        className
      )}
    >
      <div className={cn("relative", sizeClass)}>
        <DonutSvg
          box={box}
          stroke={stroke}
          ratio={ratio}
          colorVar={colorVar}
          ariaLabel={`${label}: ${centerText}`}
        />
        <DonutCenter
          colorVar={colorVar}
          centerText={centerText}
          centerSubText={centerSubText}
          centerClass={centerClass}
          subClass={subClass}
        />
      </div>
      <span className="text-foreground text-[12.5px] font-bold tracking-[-0.005em]">{label}</span>
    </Wrapper>
  );
};

type DonutSvgProps = {
  box: number;
  stroke: number;
  ratio: number;
  colorVar: string;
  ariaLabel: string;
};

const DonutSvg = ({ box, stroke, ratio, colorVar, ariaLabel }: DonutSvgProps) => {
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = box / 2;
  const dashOffset = circumference * (1 - useMountRatio(ratio));

  return (
    <svg viewBox={`0 0 ${box} ${box}`} role="img" aria-label={ariaLabel} className="h-full w-full">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={`var(${colorVar}-soft)`}
        strokeWidth={stroke}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={`var(${colorVar})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: FILL_TRANSITION }}
      />
    </svg>
  );
};

type DonutCenterProps = {
  colorVar: string;
  centerText: string;
  centerSubText?: string;
  centerClass: string;
  subClass: string;
};

const DonutCenter = ({
  colorVar,
  centerText,
  centerSubText,
  centerClass,
  subClass,
}: DonutCenterProps) => (
  <div
    className="pointer-events-none absolute inset-[18%] flex flex-col items-center justify-center text-center"
    style={{ color: `var(${colorVar})` }}
  >
    <span
      className={cn(
        "leading-[1.05] font-extrabold [text-wrap:balance] break-words hyphens-auto tabular-nums",
        centerClass
      )}
    >
      {centerText}
    </span>
    {centerSubText ? (
      <span className={cn("leading-[1.2] font-medium text-[color:var(--ink-60)]", subClass)}>
        {centerSubText}
      </span>
    ) : null}
  </div>
);

/** Animates a 0 → target ratio on mount via `useState` + rAF. */
const useMountRatio = (target: number) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted ? target : 0;
};
