import { type Metadata } from "next";
import { Post } from "~/app/_components/post";
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

  if (!data.length) return t("noPosts");

  return (
    <HydrateClient>
      <div className="text-sm font-bold">{t("title")}</div>
      {data?.map((post) => <Post post={post} key={post.id} />)}
    </HydrateClient>
  );
}
