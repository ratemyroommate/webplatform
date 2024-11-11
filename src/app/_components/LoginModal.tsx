import Link from "next/link";

export const handleOpenModal = (modalId: string) =>
  (document.getElementById(modalId) as HTMLDialogElement).showModal();
export const handleCloseModal = (modalId: string) =>
  (document.getElementById(modalId) as HTMLDialogElement).close();

export const LoginModal = () => {
  return (
    <dialog id="login-modal" className="modal">
      <div className="modal-box">
        <Link href="/api/auth/signin" className="btn btn-primary w-full">
          Login
        </Link>
      </div>
    </dialog>
  );
};
