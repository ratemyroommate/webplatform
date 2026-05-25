"use client";

import { api } from "~/trpc/react";

type NotificationBellProps = {
  children: React.ReactElement;
};

export const NotificationBell = ({ children }: NotificationBellProps) => {
  const { data: count } = api.request.unreadCount.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  if (!count) return children;

  return (
    <div className="relative inline-flex">
      {children}
      <span
        className="pointer-events-none absolute -top-0.5 -right-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-semibold text-[color:var(--primary-foreground)] tabular-nums"
        style={{ boxShadow: "0 0 0 2px var(--background)" }}
      >
        {count}
      </span>
    </div>
  );
};
