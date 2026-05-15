"use client";

import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";

type KvizToastProps = {
  session: Session | null;
};

export const KvizToast = ({ session }: KvizToastProps) => {
  const t = useTranslations("kviz");
  const router = useRouter();
  const { data } = api.kviz.getCurrentUserAnswerCount.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (!session) {
      toast.success(t("toastLoggedOut"));
    }
  }, [session, t]);

  useEffect(() => {
    if (data && data.completedQuestionCountByCurrentUser < data.totalQuestionCount) {
      toast(t("toastIncomplete"), {
        action: {
          label: t("toastAction"),
          onClick: () => router.push("/compatibility-kviz"),
        },
      });
    }
  }, [data, t, router]);

  return null;
};
