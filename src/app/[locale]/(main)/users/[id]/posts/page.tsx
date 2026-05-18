import { type Metadata } from "next";
import { Post } from "~/app/_components/post";
import { BackToFeed } from "~/components/ui/back-to-feed";
import { HydrateClient, api } from "~/trpc/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "~/i18n/seo";

type FeedPostsProps = { params: { id: string; locale: string } };

export async function generateMetadata({
  params: { id, locale },
}: FeedPostsProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("userPosts.title"),
    description: t("userPosts.description"),
    alternates: alternatesFor(locale, `/users/${id}/posts`),
  };
}

export default async function UserPosts({ params: { id, locale } }: FeedPostsProps) {
  setRequestLocale(locale);
  const data = await api.post.getAllByUserId(id);
  const t = await getTranslations("userPosts");

  return (
    <HydrateClient>
      <div className="flex w-full flex-col gap-6">
        <BackToFeed />

        <h1
          className="text-foreground font-extrabold tracking-[-0.02em]"
          style={{ fontSize: 30, lineHeight: 1.15 }}
        >
          {t("title")}
        </h1>

        {data.length ? (
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {data.map((post) => (
              <Post post={post} key={post.id} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-12 text-center text-sm">{t("noPosts")}</p>
        )}
      </div>
    </HydrateClient>
  );
}
