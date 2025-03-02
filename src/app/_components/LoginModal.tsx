import Link from "next/link";

export const handleOpenModal = (modalId: string) =>
  (document.getElementById(modalId) as HTMLDialogElement).showModal();
export const handleCloseModal = (modalId: string) =>
  (document.getElementById(modalId) as HTMLDialogElement).close();

export const LoginModal = () => {
  return (
    <dialog id="login-modal" className="modal">
      <div className="modal-box py-16">
        <form method="dialog">
          <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
            ✕
          </button>
        </form>
        <Link href="/api/auth/signin" className="btn btn-primary w-full">
          Login
        </Link>
      </div>
    </dialog>
  );
};
