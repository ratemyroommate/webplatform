"use client";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "~/trpc/react";

export const ProfileCompleteness = ({
  compact = false,
}: {
  compact?: boolean;
}) => {
  const { data, isLoading } = api.user.getProfileCompleteness.useQuery();

  if (isLoading || !data) return null;

  const { hasAbout, hasSocialLink, kvizAnswered, kvizTotal } = data;
  const kvizComplete = kvizTotal > 0 && kvizAnswered >= kvizTotal;

  const items = [
    { label: "Bemutatkozás", done: hasAbout },
    { label: "Közösségi link", done: hasSocialLink },
    {
      label: `Kompatibilitási kvíz (${kvizAnswered}/${kvizTotal})`,
      done: kvizComplete,
    },
  ];

  const completed = items.filter((i) => i.done).length;
  const percentage = Math.round((completed / items.length) * 100);

  if (percentage === 100 && compact) return null;

  if (compact) {
    return (
      <div className="w-full">
        <div className="mb-1 flex w-full items-center justify-between">
          <span className="text-sm">Profil teljessége</span>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
        <progress
          className="progress progress-warning w-full"
          value={percentage}
          max={100}
        />
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border-base-300 border p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Profil teljessége</h3>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <progress
        className="progress progress-warning mb-4 w-full"
        value={percentage}
        max={100}
      />
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CheckCircleIcon className="text-success h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="text-warning h-5 w-5" />
            )}
            <span className={item.done ? "line-through opacity-60" : ""}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      {!kvizComplete && (
        <div className="mt-3">
          <Link href="/compatibility-kviz" className="btn btn-sm btn-outline">
            Kvíz kitöltése
          </Link>
        </div>
      )}
    </div>
  );
};
