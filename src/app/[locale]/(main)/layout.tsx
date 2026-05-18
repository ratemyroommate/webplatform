import { getTranslations } from "next-intl/server";
import { Navbar } from "~/app/_components/Navbar";
import { Logo } from "~/components/ui/logo";
import { Link } from "~/i18n/navigation";
import { getServerAuthSession } from "~/server/auth";

type MainLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function MainLayout({
  children,
  params: { locale },
}: MainLayoutProps) {
  const session = await getServerAuthSession();
  const t = await getTranslations("layout");

  return (
    <>
      <main className="bg-background flex min-h-screen flex-col">
        <Navbar session={session} locale={locale} />
        <div className="mx-auto flex w-full max-w-[1240px] flex-col items-stretch gap-4 px-6 py-6">
          {children}
        </div>
      </main>
      <footer className="border-t border-[color:var(--ink-10)] py-10">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-3 px-6 text-center">
          <Logo size={20} />
          <nav className="flex flex-wrap items-center justify-center gap-5 text-[12px] text-[color:var(--ink-60)]">
            <Link href="/contact" className="whitespace-nowrap hover:text-[color:var(--foreground)]">
              {t("contact")}
            </Link>
            <Link
              href="/privacy-policy"
              className="whitespace-nowrap hover:text-[color:var(--foreground)]"
            >
              {t("privacyPolicy")}
            </Link>
            <Link href="/terms" className="whitespace-nowrap hover:text-[color:var(--foreground)]">
              {t("terms")}
            </Link>
          </nav>
          <span className="whitespace-nowrap text-[11px] text-[color:var(--ink-50)]">
            {t("copyright")}
          </span>
        </div>
      </footer>
    </>
  );
}
