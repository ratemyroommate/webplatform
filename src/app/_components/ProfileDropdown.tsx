"use client";

import { BarChart3, Check, Inbox, LogOut, UserCircle } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Link } from "~/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type ProfileDropdownProps = {
  user: NonNullable<Session["user"]>;
};

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const t = useTranslations("layout");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ring-offset-background focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
          <Avatar className="size-9">
            {user.image && <AvatarImage src={user.image} alt={t("profilePicture")} />}
            <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[300px] overflow-hidden rounded-2xl border border-[color:var(--ink-10)] bg-[var(--card)] p-0 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)]"
      >
        {/* Header — avatar + name + email */}
        <div className="flex items-center gap-3 border-b border-[color:var(--ink-10)] p-4">
          <Avatar className="size-12">
            {user.image && <AvatarImage src={user.image} alt={t("profilePicture")} />}
            <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate text-[14px] font-semibold">
              {user.name}
            </div>
            {user.email && (
              <div className="truncate text-[12px] text-[color:var(--ink-60)]">
                {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Profile completeness */}
        <CompletenessSection userId={user.id} />

        {/* Nav items */}
        <div className="p-1">
          <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
            <Link href={`/users/${user.id}`}>
              <UserCircle />
              {t("profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
            <Link href={`/users/${user.id}/posts`}>
              <Inbox />
              {t("myPosts")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
            <Link href="/compatibility-kviz">
              <BarChart3 />
              <span className="flex-1">{t("quiz")}</span>
              <QuizDoneCheck />
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Sign out */}
        <div className="border-t border-[color:var(--ink-10)] p-1">
          <DropdownMenuItem
            className="rounded-lg px-3 py-2 text-[13px] text-[color:var(--ink-60)]"
            onSelect={() => {
              toast.success(t("signedOut"));
              void signOut({ callbackUrl: "/" });
            }}
          >
            <LogOut />
            {t("signOut")}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CompletenessSection({ userId }: { userId: string }) {
  const t = useTranslations("layout");
  const { data } = api.user.getProfileCompleteness.useQuery();
  if (!data) return null;

  const items = [data.hasAbout, data.hasSocialLink, data.hasPhoneNumber];
  if (data.kvizTotal > 0) items.push(data.kvizAnswered >= data.kvizTotal);
  const completed = items.filter(Boolean).length;
  const total = items.length;
  const percentage = Math.round((completed / total) * 100);
  const stepsLeft = total - completed;

  return (
    <Link
      href={`/users/${userId}`}
      className="block border-b border-[color:var(--ink-10)] p-4 transition-colors hover:bg-[var(--ink-05)]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[color:var(--ink-70)]">
          {t("profileCompleteness")}
        </span>
        <span className="text-foreground text-[12px] font-semibold tabular-nums">
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--ink-10)]">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-[11px] text-[color:var(--ink-60)]">
        {stepsLeft > 0
          ? `${t("stepsLeft", { count: stepsLeft })} →`
          : `${t("profileComplete")} ✓`}
      </div>
    </Link>
  );
}

function QuizDoneCheck() {
  const { data } = api.user.getProfileCompleteness.useQuery();
  if (!data || data.kvizTotal === 0 || data.kvizAnswered < data.kvizTotal) return null;
  return <Check className="text-[var(--accent-green-hex)]" />;
}
