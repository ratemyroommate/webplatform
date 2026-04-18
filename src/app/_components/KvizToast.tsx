"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";

type KvizToastProps = {
  session: Session | null;
};

export const KvizToast = ({ session }: KvizToastProps) => {
  const t = useTranslations("kviz");
  const { data } = api.kviz.getCurrentUserAnswerCount.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (!session) {
      toast.success(t("toastLoggedOut"));
    }
  }, [session]);

  useEffect(() => {
    if (data && data.completedQuestionCountByCurrentUser < data.totalQuestionCount) {
      toast(() => (
        <span className="flex items-center gap-2">
          {t("toastIncomplete")}
          <Link className="btn btn-secondary" href="/compatibility-kviz">
            {t("toastAction")}
          </Link>
        </span>
      ));
    }
  }, [data]);

  return null;
};
