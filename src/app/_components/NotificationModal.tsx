"use client";

import { Bell, Check, Eye, Inbox, Loader2, X } from "lucide-react";
import { api } from "~/trpc/react";
import { Link } from "~/i18n/navigation";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "~/i18n/navigation";
import type { Request } from "@prisma/client";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";
import type { Session } from "next-auth";
import { CompatibilityScore } from "./CompatibilityScore";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Skeleton } from "boneyard-js/react";
import { NotificationListFixture } from "./skeleton-fixtures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export const NotificationModal = ({ session }: { session: Session }) => {
  const t = useTranslations("notification");
  const [open, setOpen] = useState(false);
  const { data: requests, isLoading } = api.request.getAll.useQuery();
  const recievedRequests = requests?.recievedRequests;
  const sentRequests = requests?.sentRequests;
  const pathname = usePathname();
  const router = useRouter();
  const utils = api.useUtils();
  const markSeen = api.request.markSeen.useMutation({
    onSuccess: () => {
      void utils.request.unreadCount.invalidate();
    },
  });
  const updateRequest = api.request.update.useMutation({
    onSuccess: () => {
      router.refresh();
      void utils.request.getAll.invalidate();
      void utils.request.unreadCount.invalidate();
      toast.success(t("updateSuccess"));
    },
  });
  useEffect(() => setOpen(false), [pathname]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) markSeen.mutate();
  };

  return (
    <>
      <NotificationBell>
        <Button
          variant="flat"
          size="icon-round"
          aria-label="notifications"
          onClick={() => handleOpenChange(true)}
        >
          <Bell size={15} strokeWidth={1.75} />
        </Button>
      </NotificationBell>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="bg-background flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-[color:var(--ink-10)] px-5 py-4">
            <SheetTitle className="text-foreground text-[17px] font-extrabold tracking-[-0.01em]">
              {t("title")}
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="received" className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-[color:var(--ink-10)] px-5 pt-3">
              <TabsList className="w-full">
                <TabsTrigger value="received" className="flex-1">
                  {t("receivedTab")}
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex-1">
                  {t("sentTab")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="received" className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {isLoading ? (
                <LoadingList />
              ) : recievedRequests?.length ? (
                <div className="flex flex-col gap-3">
                  {recievedRequests.map((request) => (
                    <RecievedRequest
                      key={request.id}
                      session={session}
                      request={request}
                      updateRequest={updateRequest}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title={t("noReceived")} hint={t("noReceivedHint")} />
              )}
            </TabsContent>

            <TabsContent value="sent" className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {isLoading ? (
                <LoadingList />
              ) : sentRequests?.length ? (
                <div className="flex flex-col gap-3">
                  {sentRequests.map((request) => (
                    <SentRequest key={request.id} request={request} updateRequest={updateRequest} />
                  ))}
                </div>
              ) : (
                <EmptyState title={t("noSent")} hint={t("noSentHint")} />
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};

const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="mx-auto flex max-w-[260px] flex-col items-center gap-2 py-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--ink-05)] text-[color:var(--ink-50)]">
      <Inbox size={20} strokeWidth={1.75} />
    </div>
    <p className="text-foreground text-[14px] font-semibold">{title}</p>
    <p className="text-[12.5px] leading-snug text-[color:var(--ink-60)]">{hint}</p>
  </div>
);

const NotificationCard = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--ink-10)] bg-[var(--card)] p-3">
    {children}
  </div>
);

const LoadingList = () => (
  <Skeleton
    name="notification-list"
    loading
    animate="shimmer"
    fixture={<NotificationListFixture />}
  >
    <NotificationListFixture />
  </Skeleton>
);

const RecievedRequest = ({
  session,
  request,
  updateRequest,
}: {
  session: Session;
  request: Request & {
    user: { id: string; image: string | null; name: string | null };
  };
  updateRequest: ReturnType<typeof api.request.update.useMutation>;
}) => {
  const t = useTranslations("notification");
  const tc = useTranslations("common");
  const [accordion, setAccordion] = useState<string>("");
  const isDetailsOpen = accordion === "details";

  return (
    <NotificationCard>
      <div className="flex flex-row items-center justify-between gap-2">
        <Link href={`/users/${request.user.id}`} className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10">
            {request.user.image && (
              <AvatarImage src={request.user.image} alt={request.user.name ?? "Profile image"} />
            )}
            <AvatarFallback>{request.user.name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="text-foreground line-clamp-1 text-[13.5px] font-semibold">
              {request.user.name}
            </div>
            <RequestStatusBadge status={request.status} />
          </div>
        </Link>
        {request.status === "PENDING" && (
          <RequestActions request={request} updateRequest={updateRequest} />
        )}
      </div>
      <Accordion type="single" collapsible value={accordion} onValueChange={setAccordion}>
        <AccordionItem value="details" className="border-b-0">
          <AccordionTrigger className="py-1 text-[12px] font-medium text-[color:var(--ink-60)] hover:no-underline">
            {tc("moreDetails")}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2">
            <p className="text-[13px] text-[color:var(--ink-70)]">
              {request.comment === "" ? tc("noComment") : request.comment}
            </p>
            {isDetailsOpen && (
              <CompatibilityScore compareUserId={request.userId} session={session} />
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="min-w-0 flex-1 basis-0">
                <Link href={`/posts/${request.postId}`} className="truncate">
                  {t("relatedPost")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="min-w-0 flex-1 basis-0">
                <Link href={`/compatibility-kviz/${request.userId}`} className="truncate">
                  {t("quizAnswers")}
                </Link>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </NotificationCard>
  );
};

const SentRequest = ({
  request,
  updateRequest,
}: {
  request: Request;
  updateRequest: ReturnType<typeof api.request.update.useMutation>;
}) => {
  const t = useTranslations("notification");
  const tc = useTranslations("common");
  const isPending = updateRequest.isPending && updateRequest.variables?.requestId === request.id;

  return (
    <NotificationCard>
      <div className="flex flex-row items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm" className="min-w-0">
          <Link href={`/posts/${request.postId}`}>
            <Eye />
            {t("post")}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <RequestStatusBadge status={request.status} />
          {request.status === "PENDING" && (
            <Button
              variant="destructive"
              size="icon"
              aria-label={t("cancelRequest")}
              disabled={isPending}
              onClick={() => updateRequest.mutate({ requestId: request.id, status: "DENIED" })}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <X />}
            </Button>
          )}
        </div>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="details" className="border-b-0">
          <AccordionTrigger className="py-1 text-[12px] font-medium text-[color:var(--ink-60)] hover:no-underline">
            {tc("moreDetails")}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-[13px] text-[color:var(--ink-70)]">
              {request.comment === "" ? tc("noComment") : request.comment}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </NotificationCard>
  );
};

const RequestActions = ({
  request,
  updateRequest,
}: {
  request: Request;
  updateRequest: ReturnType<typeof api.request.update.useMutation>;
}) => {
  const t = useTranslations("notification");
  const isPending = updateRequest.isPending && updateRequest.variables?.requestId === request.id;
  const pendingStatus = isPending ? updateRequest.variables?.status : undefined;

  return (
    <div className="flex shrink-0 gap-2">
      <Button
        size="icon"
        aria-label={t("accept")}
        disabled={isPending}
        onClick={() => updateRequest.mutate({ requestId: request.id, status: "ACCEPTED" })}
      >
        {pendingStatus === "ACCEPTED" ? <Loader2 className="animate-spin" /> : <Check />}
      </Button>
      <Button
        size="icon"
        variant="destructive"
        aria-label={t("decline")}
        disabled={isPending}
        onClick={() => updateRequest.mutate({ requestId: request.id, status: "DENIED" })}
      >
        {pendingStatus === "DENIED" ? <Loader2 className="animate-spin" /> : <X />}
      </Button>
    </div>
  );
};
