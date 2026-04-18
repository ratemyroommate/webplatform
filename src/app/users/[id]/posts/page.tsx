import { Post } from "~/app/_components/post";
import { HydrateClient, api } from "~/trpc/server";
import { getTranslations } from "next-intl/server";

type FeedPostsProps = { params: { id: string } };

export default async function UserPosts({ params: { id } }: FeedPostsProps) {
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
