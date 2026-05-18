import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck, Sparkles, Star } from "lucide-react";
import { redirect } from "next/navigation";
import type { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { GoogleG } from "~/components/ui/google-g";
import { Logo } from "~/components/ui/logo";
import { Link } from "~/i18n/navigation";
import { getServerAuthSession } from "~/server/auth";
import { GoogleSignInButton } from "./GoogleSignInButton";

type SignInPageProps = {
  params: { locale: string };
};

type T = ReturnType<typeof useTranslations<"signin">>;

export async function generateMetadata({
  params: { locale },
}: SignInPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "signin" });
  return { title: t("title") };
}

export default async function SignInPage({ params: { locale } }: SignInPageProps) {
  setRequestLocale(locale);

  const session = await getServerAuthSession();
  if (session?.user) redirect("/");

  const t = await getTranslations("signin");

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Header strip */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-bold text-[color:var(--ink-60)] transition-colors hover:text-[color:var(--foreground)]"
        >
          <ArrowLeft size={14} strokeWidth={2.25} />
          {t("backToFeed")}
        </Link>
        <Logo />
        <span className="w-[80px]" aria-hidden />
      </div>

      {/* Split layout */}
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-8 px-6 py-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <SignInForm t={t} />
        <DecorativePanel t={t} />
      </div>
    </div>
  );
}

function SignInForm({ t }: { t: T }) {
  return (
    <div className="flex flex-col justify-center py-8 lg:py-12">
      <div className="mx-auto w-full max-w-[420px]">
        <span
          className="mb-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider"
          style={{ background: "var(--primary-10)", color: "var(--primary)" }}
        >
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "currentColor" }}
          />
          {t("welcome")}
        </span>

        <h1 className="text-foreground mt-4 text-[36px] font-extrabold leading-[1.05] tracking-[-0.025em] sm:text-[42px]">
          {t("headline")}
        </h1>
        <p className="mt-3 max-w-[400px] text-[14px] leading-[1.55] text-[color:var(--ink-70)]">
          {t("subtitle")}
        </p>

        <GoogleSignInButton />

        <p className="mt-3 text-center text-[11.5px] font-bold uppercase tracking-wider text-[color:var(--ink-60)]">
          {t("tagline")}
        </p>

        <div className="bg-card mt-8 rounded-2xl border border-[color:var(--ink-10)] p-4">
          <div className="flex items-start gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--primary-10)", color: "var(--primary)" }}
            >
              <Sparkles size={16} strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <div className="text-foreground text-[13.5px] font-extrabold">
                {t("newHere")}
              </div>
              <div className="mt-0.5 text-[12px] leading-[1.5] text-[color:var(--ink-60)]">
                {t("newHereSub")}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-[11.5px] leading-[1.6] text-[color:var(--ink-60)]">
          {t("termsLead")}{" "}
          <Link
            href="/terms"
            className="font-bold text-[color:var(--ink-80)] underline decoration-[color:var(--ink-30)] underline-offset-2 hover:decoration-[color:var(--ink-70)]"
          >
            {t("termsLink")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            href="/privacy-policy"
            className="font-bold text-[color:var(--ink-80)] underline decoration-[color:var(--ink-30)] underline-offset-2 hover:decoration-[color:var(--ink-70)]"
          >
            {t("privacyLink")}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function DecorativePanel({ t }: { t: T }) {
  const stats = [
    { value: t("stats.activePostsValue"), label: t("stats.activePosts") },
    { value: t("stats.membersJoinedValue"), label: t("stats.membersJoined") },
    { value: t("stats.matchesThisWeekValue"), label: t("stats.matchesThisWeek") },
  ];

  return (
    <div
      className="text-primary-foreground relative hidden overflow-hidden rounded-[28px] p-6 lg:flex lg:flex-col lg:justify-between"
      style={{ background: "var(--primary)", minHeight: 560 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(255,255,255,.7) 0%, transparent 50%), radial-gradient(circle at 78% 78%, rgba(0,0,0,.35) 0%, transparent 55%)",
        }}
      />

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl px-4 py-3 text-[color:var(--background)]"
            style={{ background: "color-mix(in oklab, var(--foreground) 88%, transparent)" }}
          >
            <div className="text-[24px] font-extrabold leading-none tracking-[-0.02em] tabular-nums">
              {s.value}
            </div>
            <div className="mt-1.5 text-[10.5px] font-bold uppercase leading-tight tracking-wider opacity-75">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Floating testimonial cards */}
      <div className="relative z-10 mt-8 flex-1">
        <TestimonialCard
          className="absolute right-2 top-2 w-[260px] rotate-[2deg]"
          name={t("testimonials.first.name")}
          fallback={t("testimonials.first.initials")}
          avatarColor="#7C3AED"
          quote={t("testimonials.first.quote")}
          meta={
            <span className="flex items-center gap-0.5 text-[var(--star-hex)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} fill="currentColor" stroke="none" />
              ))}
            </span>
          }
        />

        <TestimonialCard
          className="absolute left-2 top-[120px] w-[240px] -rotate-[2deg]"
          name={t("testimonials.second.name")}
          fallback={t("testimonials.second.initials")}
          avatarColor="var(--primary)"
          quote={t("testimonials.second.quote")}
          meta={
            <span
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: "var(--accent-green-05)", color: "var(--accent-green-hex)" }}
            >
              {t("testimonials.matchPct", { pct: 94 })}
            </span>
          }
        />

        <div
          className="absolute bottom-2 right-4 w-[230px] rotate-[1.5deg] rounded-2xl p-4 text-[color:var(--background)] shadow-lg"
          style={{ background: "var(--foreground)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--primary)" }}
            >
              <GoogleG size={16} />
            </span>
            <div className="min-w-0">
              <div className="whitespace-nowrap text-[12.5px] font-extrabold">
                {t("quotes.googleOnly")}
              </div>
              <div className="whitespace-nowrap text-[10.5px] opacity-70">
                {t("quotes.oneClick")}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold opacity-80">
            <ShieldCheck size={12} strokeWidth={2.5} />
            {t("verifiedAccounts")}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto flex items-center justify-between">
        <Logo accent="var(--foreground)" />
        <span
          className="whitespace-nowrap text-[10.5px] font-bold uppercase tracking-wider"
          style={{ color: "color-mix(in oklab, var(--primary-foreground) 70%, transparent)" }}
        >
          {t("madeIn")}
        </span>
      </div>
    </div>
  );
}

function TestimonialCard({
  className,
  name,
  fallback,
  avatarColor,
  quote,
  meta,
}: {
  className?: string;
  name: string;
  fallback: string;
  avatarColor: string;
  quote: string;
  meta: React.ReactNode;
}) {
  return (
    <div className={`bg-card rounded-2xl p-4 shadow-lg ${className ?? ""}`}>
      <div className="flex items-center gap-2.5">
        <Avatar className="size-9">
          <AvatarFallback
            className="text-[12px] font-bold text-white"
            style={{ background: avatarColor }}
          >
            {fallback}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-foreground text-[12.5px] font-extrabold">{name}</div>
          {meta}
        </div>
      </div>
      <p className="mt-2.5 text-[12px] leading-[1.45] text-[color:var(--ink-80)]">
        {`"${quote}"`}
      </p>
    </div>
  );
}
