"use client";

import type { RequestStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export const RequestStatusBadge = ({ status }: { status: RequestStatus }) => {
  const t = useTranslations("enums.requestStatus");
  const label = t(status);
  const base = "text-[10.5px] font-extrabold uppercase tracking-wider";
  switch (status) {
    case "ACCEPTED":
      return (
        <Badge
          className={cn(
            base,
            "bg-[color:var(--accent-green-05)] text-[color:var(--accent-green-hex)]"
          )}
        >
          {label}
        </Badge>
      );
    case "DENIED":
      return (
        <Badge variant="destructive" className={base}>
          {label}
        </Badge>
      );
    default:
      return (
        <Badge className={cn(base, "bg-[color:var(--primary-10)] text-[color:var(--ink-80)]")}>
          {label}
        </Badge>
      );
  }
};
