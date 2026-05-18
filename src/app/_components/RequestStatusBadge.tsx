"use client";

import type { RequestStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Badge } from "~/components/ui/badge";

export const RequestStatusBadge = ({ status }: { status: RequestStatus }) => {
  const t = useTranslations("enums.requestStatus");
  const label = t(status);
  switch (status) {
    case "ACCEPTED":
      return <Badge className="bg-emerald-500 hover:bg-emerald-500">{label}</Badge>;
    case "DENIED":
      return <Badge variant="destructive">{label}</Badge>;
    default:
      return <Badge className="bg-amber-500 hover:bg-amber-500">{label}</Badge>;
  }
};
