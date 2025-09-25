import { Post } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

type FeedPostsProps = { params: { id: string } };

export default async function UserPosts({ params: { id } }: FeedPostsProps) {
  const data = await api.post.getAllByUserId(id);

  if (!data.length) return "Nem találtunk posztot a megadott felhasználótól.";

  return (
    <HydrateClient>
      <div className="text-sm font-bold">Saját posztok</div>
      {data?.map((post) => <Post post={post} key={post.id} />)}
    </HydrateClient>
  );
}
