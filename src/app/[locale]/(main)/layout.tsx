import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Navbar } from "~/app/_components/Navbar";
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
      <footer className="bg-foreground text-background flex h-48 flex-col items-center justify-center gap-2">
        <Image src="/R-white.png" width={64} height={64} alt="RateMyRoommate" />
        <nav className="flex flex-col items-center gap-1 text-sm">
          <Link href="/contact" className="hover:underline">
            {t("contact")}
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            {t("privacyPolicy")}
          </Link>
        </nav>
        <span className="text-xs opacity-70">{t("copyright")}</span>
      </footer>
    </>
  );
}
