import { type Metadata } from "next";
import { ArrowLeft, BedDouble, Phone, Shield, Star, User, Users } from "lucide-react";
import { PostGallery } from "~/app/_components/PostGallery";
import { PostDelete } from "~/app/_components/PostDelete";
import { PostModal } from "~/app/_components/PostModal";
import { RequestModal } from "~/app/_components/RequestModal";
import { ShareModal } from "~/app/_components/ShareModal";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { Link } from "~/i18n/navigation";
import { CompatibilityScore } from "~/app/_components/CompatibilityScore";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { OpenSpotCard } from "~/components/ui/open-spot-card";
import { JsonLd } from "~/app/_components/JsonLd";
import { env } from "~/env";
import { alternatesFor } from "~/i18n/seo";
import { getAverageRating } from "~/utils/helpers";

type PostPageProps = { params: { id: string; locale: string } };

export async function generateMetadata({
  params: { id, locale },
}: PostPageProps): Promise<Metadata> {
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const tLocation = await getTranslations({ locale, namespace: "enums.location" });
  const post = await api.post.getById(id);
  if (!post) return { title: tMeta("home.title") };

  const locationLabel = tLocation(post.location);
  const title = tMeta("post.titleWithPrice", { location: locationLabel, price: post.price });
  const description = post.description?.trim().length
    ? post.description.slice(0, 200)
    : tMeta("post.description", { location: locationLabel, price: post.price });
  const path = `/posts/${id}`;
  const alts = alternatesFor(locale, path);

  return {
    title,
    description,
    alternates: alts,
    openGraph: {
      type: "article",
      url: alts.canonical,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({ params: { id, locale } }: PostPageProps) {
  setRequestLocale(locale);
  const session = await getServerAuthSession();
  const post = await api.post.getById(id);
  const t = await getTranslations("post");
  const tCommon = await getTranslations("common");
  const tMeta = await getTranslations("metadata");
  const tLocation = await getTranslations("enums.location");
  const tAge = await getTranslations("enums.age");
  const tGender = await getTranslations("enums.gender");

  if (!post) return t("notFound");

  const h1 = tMeta("post.titleWithPrice", {
    location: tLocation(post.location),
    price: post.price,
  });
  const canEdit = session?.user.id === post.createdById;
  const canRequest =
    !session?.user.id ||
    (post.createdById !== session.user.id &&
      !post.requests.map((request) => request.userId).includes(session.user.id));

  const filled = post.featuredUsers.length;
  const total = post.maxPersonCount;
  const free = Math.max(0, total - filled);

  const baseUrl = env.NEXTAUTH_URL.startsWith("http")
    ? env.NEXTAUTH_URL
    : `https://${env.NEXTAUTH_URL}`;
  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: h1,
    description: post.description,
    image: post.images.map((img) => img.url),
    url: `${baseUrl}/posts/${id}`,
    category: "Accommodation",
    offers: {
      "@type": "Offer",
      price: post.price * 1000,
      priceCurrency: "HUF",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/posts/${id}`,
    },
    brand: post.createdBy?.name ? { "@type": "Person", name: post.createdBy.name } : undefined,
  };

  return (
    <HydrateClient>
      <JsonLd data={productLd} />
      <h1 className="sr-only">{h1}</h1>

      <div className="w-full">
        {/* Top utility bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-[13px] font-medium"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            {tCommon("cancel")}
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <ShareModal url={`${baseUrl}/posts/${id}`} title={h1} />
            {canEdit && (
              <>
                <PostModal post={post} userId={session?.user.id} />
                <PostDelete id={post.id} />
              </>
            )}
          </div>
        </div>

        {/* Gallery */}
        <PostGallery images={post.images} alt={h1} />

        {/* Two-column body */}
        <div className="mt-10 grid grid-cols-12 gap-y-10 lg:gap-x-10">
          {/* Left column */}
          <div className="col-span-12 min-w-0 space-y-10 lg:col-span-8">
            {/* Title + meta */}
            <div>
              <div className="text-muted-foreground mb-2 text-[12px] font-medium tracking-[0.14em] uppercase">
                {tLocation(post.location)}
              </div>
              <h2
                className="text-foreground font-extrabold tracking-[-0.025em]"
                style={{ fontSize: "clamp(28px, 3.4vw, 40px)", lineHeight: 1.1 }}
              >
                {post.description ? post.description.split("\n")[0] : tLocation(post.location)}
              </h2>
              <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Users size={14} strokeWidth={1.75} />
                  {t("personHousehold", { count: total })}
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <BedDouble size={14} strokeWidth={1.75} />
                  {t("freeSpots", { count: free })}
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <User size={14} strokeWidth={1.75} />
                  {tAge(String(post.age))}
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  {tGender(String(post.gender))}
                </span>
              </div>
            </div>

            <Separator />

            {/* Roommates */}
            <section>
              <div className="mb-6 flex items-baseline justify-between gap-3">
                <h3
                  className="text-foreground font-extrabold tracking-[-0.02em]"
                  style={{ fontSize: 28, lineHeight: 1.15 }}
                >
                  {t("roommates")}
                </h3>
                <span className="text-muted-foreground text-[12.5px] whitespace-nowrap tabular-nums">
                  {filled} / {total}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {post.featuredUsers.map((u) => {
                  const avg = getAverageRating(u);
                  return (
                    <Link key={u.id} href={`/users/${u.id}`} className="h-full min-w-0">
                      <Card className="hover:border-foreground/25 h-full min-w-0 gap-2 p-3 transition-colors sm:p-4">
                        <Avatar className="size-10 sm:size-12">
                          {u.image && <AvatarImage src={u.image} alt={u.name ?? ""} />}
                          <AvatarFallback>{(u.name ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-foreground truncate text-[13.5px] font-semibold">
                          {u.name}
                        </div>
                        {avg > 0 && (
                          <div className="text-muted-foreground flex items-center gap-1 text-[11px] tabular-nums">
                            <Star size={10} className="fill-[var(--star-hex)] stroke-none" />
                            {avg.toFixed(1)}
                          </div>
                        )}
                        {u.id === post.createdById && (
                          <Badge
                            variant="secondary"
                            className="text-primary mt-auto max-w-full self-start truncate bg-[color:var(--primary-10)] text-[10.5px] tracking-wider uppercase"
                          >
                            {t("advertiser")}
                          </Badge>
                        )}
                      </Card>
                    </Link>
                  );
                })}
                {Array.from({ length: free }).map((_, i) => (
                  <OpenSpotCard
                    key={`free-${i}`}
                    title={t("openSpotTitle")}
                    subtitle={t("openSpotSubtitle")}
                  />
                ))}
              </div>
            </section>

            {post.description && (
              <>
                <Separator />
                <section>
                  <h3
                    className="text-foreground mb-3 font-extrabold tracking-[-0.02em]"
                    style={{ fontSize: 28, lineHeight: 1.15 }}
                  >
                    {t("description")}
                  </h3>
                  <p className="max-w-[640px] text-[14.5px] leading-[1.7] text-[color:var(--ink-80)]">
                    {post.description}
                  </p>
                </section>
              </>
            )}

            <Separator />

            <section>
              <CompatibilityScore compareUserId={post.createdById} session={session} />
            </section>
          </div>

          {/* Right column — sticky booking card */}
          <aside className="col-span-12 min-w-0 lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-[88px]">
              <Card className="overflow-hidden rounded-[24px] p-0 shadow-[0_1px_0_var(--ink-05),0_12px_32px_-16px_rgba(0,0,0,0.08)]">
                <div className="px-6 pt-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-foreground text-[34px] leading-none font-extrabold tracking-[-0.02em] tabular-nums sm:text-[44px]">
                      {post.price}k
                    </span>
                    <span className="text-muted-foreground text-[13px]">{t("priceUnit")}</span>
                  </div>
                </div>

                <div className="bg-background mx-4 my-5 flex flex-col items-start gap-2 rounded-2xl border p-3 sm:mx-6 sm:flex-row sm:items-center sm:gap-3">
                  <Link
                    href={`/users/${post.createdById}`}
                    className="flex w-full min-w-0 flex-1 items-center gap-3 transition-colors"
                  >
                    <Avatar className="size-10">
                      {post.createdBy.image && (
                        <AvatarImage src={post.createdBy.image} alt={t("advertiserAlt")} />
                      )}
                      <AvatarFallback>
                        {post.createdBy.name?.charAt(0).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground truncate text-[13px] font-semibold">
                        {post.createdBy.name}
                      </div>
                      <Badge variant="secondary" className="mt-0.5 text-[10px]">
                        {t("advertiser")}
                      </Badge>
                    </div>
                  </Link>
                  {post.createdBy.phoneNumber && (
                    <a
                      href={`tel:${post.createdBy.phoneNumber}`}
                      className="text-primary inline-flex h-8 max-w-full min-w-0 shrink items-center gap-1 truncate rounded-full px-2 text-[11px] font-medium hover:underline"
                    >
                      <Phone size={12} className="shrink-0" />
                      <span className="truncate">{post.createdBy.phoneNumber}</span>
                    </a>
                  )}
                </div>

                <div className="space-y-2 px-6 pb-6">
                  {canRequest && <RequestModal postId={post.id} userId={session?.user.id} />}
                </div>

                <div className="text-muted-foreground border-t px-6 py-3.5 text-[11.5px]">
                  <Shield size={12} strokeWidth={2} className="mr-1.5 inline" />
                  {t("applyNonBinding")}
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </HydrateClient>
  );
}
