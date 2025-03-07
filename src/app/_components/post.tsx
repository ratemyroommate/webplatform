import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";
import { PostModal } from "./PostModal";
import { Images } from "./Images";
import { PostPrice } from "./PostPrice";

type PostProps = {
  post: PostExtended;
  userId?: string;
};

export const Post = ({ post, userId }: PostProps) => {
  const canEdit = userId === post.createdById;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="card flex w-full flex-col items-center justify-between gap-6 bg-base-100 p-4 shadow-xl sm:flex-row"
    >
      <Images images={post.images} />
      <div className="flex w-full flex-col gap-4">
        <FeaturedUsers {...post} />
        <PostPrice price={post.price} />
      </div>
    </Link>
  );
};
