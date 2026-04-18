import Link from "next/link";
import { XButton } from "./CloseButton";
import { useTranslations } from "next-intl";

export const handleOpenModal = (modalId: string) =>
  (document.getElementById(modalId) as HTMLDialogElement).showModal();
export const handleCloseModal = (modalId: string) =>
  (document.getElementById(modalId) as HTMLDialogElement).close();

export const LoginModal = () => {
  const t = useTranslations("loginModal");
  return (
    <dialog id="login-modal" className="modal">
      <div className="modal-box py-16">
        <XButton />
        <p className="mb-4 text-center text-lg">{t("message")}</p>
        <Link href="/api/auth/signin" className="btn btn-primary w-full">
          {t("login")}
        </Link>
      </div>
    </dialog>
  );
};
