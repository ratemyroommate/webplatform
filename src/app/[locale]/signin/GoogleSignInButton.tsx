"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { GoogleG } from "~/components/ui/google-g";

export function GoogleSignInButton() {
  const t = useTranslations("signin");
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    void signIn("google", { callbackUrl: params.get("callbackUrl") ?? "/" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="group mt-7 flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--foreground)] text-[15px] font-extrabold text-[color:var(--background)] transition-all hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-80"
      style={{
        boxShadow:
          "0 1px 0 rgba(0,0,0,.08), 0 5px 0 color-mix(in oklab, var(--foreground) 65%, transparent), 0 12px 30px -10px rgba(0,0,0,.25)",
      }}
    >
      {loading ? (
        <>
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2"
            style={{ borderColor: "var(--background)", borderTopColor: "transparent" }}
          />
          {t("continuing")}
        </>
      ) : (
        <>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white">
            <GoogleG size={16} />
          </span>
          {t("continueGoogle")}
        </>
      )}
    </button>
  );
}
