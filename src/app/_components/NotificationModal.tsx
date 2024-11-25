"use client";

import { BellIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { handleCloseModal, handleOpenModal } from "./LoginModal";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RequestStatus } from "@prisma/client";
import { toast } from "react-hot-toast";
import { NotificationBell } from "./NotificationBell";

export const NotificationModal = () => {
  const { data: requests, isLoading } = api.request.getAll.useQuery();
  const pathname = usePathname();
  const router = useRouter();
  const utils = api.useUtils();
  const updateRequest = api.request.update.useMutation({
    onSuccess: () => {
      router.refresh();
      utils.request.getAll.invalidate();
      toast.success("Request updated successfully");
    },
  });
  useEffect(() => handleCloseModal("notification-modal"), [pathname]);

  return (
    <>
      <NotificationBell requests={requests}>
        <BellIcon
          onClick={() => handleOpenModal("notification-modal")}
          width={30}
        />
      </NotificationBell>
      <dialog id="notification-modal" className="modal">
        <div className="modal-box h-96">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="pb-4 text-lg font-bold">Kérelmek</h3>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
            </div>
          ) : requests?.length ? (
            <div className="flex flex-col gap-2">
              {requests?.map((request) => (
                <div
                  key={request.id}
                  className="card border-base-200 flex flex-row items-center justify-between border-2 p-2"
                >
                  <div className="flew-row flex items-center gap-4">
                    <Link
                      className="h-10 w-10"
                      href={`/users/${request.user.id}`}
                    >
                      <div className="avatar">
                        <div className="rounded-full">
                          <img src={request.user.image ?? ""} />
                        </div>
                      </div>
                    </Link>
                    <div className="w-2/3">
                      <div className="line-clamp-1 overflow-hidden">
                        {request.user.name}
                      </div>
                      <Badge status={request.status} />
                    </div>
                  </div>
                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        className="btn btn-success btn-square"
                        onClick={() =>
                          updateRequest.mutate({
                            requestId: request.id,
                            status: "ACCEPTED",
                          })
                        }
                      >
                        <CheckIcon width={20} />
                      </button>
                      <button
                        className="btn btn-error btn-square"
                        onClick={() =>
                          updateRequest.mutate({
                            requestId: request.id,
                            status: "DENIED",
                          })
                        }
                      >
                        <XMarkIcon width={20} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            "Nincs értesítés"
          )}
        </div>
      </dialog>
    </>
  );
};

const Badge = ({ status }: { status: RequestStatus }) => {
  switch (status) {
    case "ACCEPTED":
      return <div className="badge badge-success">{status}</div>;
    case "DENIED":
      return <div className="badge badge-error">{status}</div>;
    default:
      return <div className="badge badge-warning">{status}</div>;
  }
};
