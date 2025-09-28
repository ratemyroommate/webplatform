"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";

type KvizToastProps = {
  session: Session | null;
};

export const KvizToast = ({ session }: KvizToastProps) => {
  const { data } = api.kviz.getCurrentUserAnswerCount.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (
      data &&
      data.completedQuestionCountByCurrentUser < data.totalQuestionCount
    ) {
      toast(Toast);
    }
  }, [data]);

  return null;
};

const Toast = () => (
  <span className="flex items-center gap-2">
    Töltsd ki a kompatibilitás kvízt
    <Link className="btn btn-secondary" href="/compatibility-kviz">
      Kitöltés
    </Link>
  </span>
);
