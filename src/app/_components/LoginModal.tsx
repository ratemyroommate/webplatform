"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type LoginModalContextValue = {
  open: () => void;
  close: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used inside <LoginModalProvider>");
  return ctx;
}

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("loginModal");
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{t("message")}</DialogTitle>
            <DialogDescription className="sr-only">{t("message")}</DialogDescription>
          </DialogHeader>
          <Button asChild className="w-full">
            <Link href="/signin">{t("login")}</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </LoginModalContext.Provider>
  );
}
