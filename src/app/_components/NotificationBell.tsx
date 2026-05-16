import type { Request } from "@prisma/client";
import { Badge } from "~/components/ui/badge";

type NotificationBellProps = {
  children: React.ReactElement;
  requests?: Request[];
};

export const NotificationBell = ({ children, requests }: NotificationBellProps) =>
  requests?.length ? (
    <div className="relative inline-flex">
      {children}
      <Badge
        variant="destructive"
        className="pointer-events-none absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
      >
        {requests.length}
      </Badge>
    </div>
  ) : (
    children
  );
