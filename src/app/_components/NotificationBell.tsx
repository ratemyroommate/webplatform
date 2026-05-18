import type { Request } from "@prisma/client";

type NotificationBellProps = {
  children: React.ReactElement;
  requests?: Request[];
};

export const NotificationBell = ({ children, requests }: NotificationBellProps) =>
  requests?.length ? (
    <div className="relative inline-flex">
      {children}
      <span
        className="pointer-events-none absolute -top-0.5 -right-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-semibold tabular-nums text-[color:var(--primary-foreground)]"
        style={{ boxShadow: "0 0 0 2px var(--background)" }}
      >
        {requests.length}
      </span>
    </div>
  ) : (
    children
  );
