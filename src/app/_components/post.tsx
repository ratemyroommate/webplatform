import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";
import { Images } from "./Images";
import { PostInfo } from "./PostInfo";

type PostProps = {
  post: PostExtended;
};

export const Post = ({ post }: PostProps) => {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="card bg-base-100 flex w-full flex-col items-center justify-between gap-6 p-4 shadow-xl sm:flex-row"
    >
      <Images images={post.images} />
      <div className="flex w-full flex-col gap-4">
        <FeaturedUsers {...post} />
        <PostInfo post={post} />
      </div>
    </Link>
  );
};
