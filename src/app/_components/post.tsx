import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";
import { PostModal } from "./PostModal";

type PostProps = {
  post: PostExtended;
  userId?: string;
};

export const Post = ({ post, userId }: PostProps) => {
  const canEdit = userId === post.createdById;

  return (
    <div className="card bg-base-100 flex w-full flex-col items-center justify-between gap-6 p-8 shadow-xl sm:flex-row">
      <div className="skeleton h-48 w-48 min-w-48"></div>
      <div className="flex flex-col gap-6">
        <FeaturedUsers {...post} />
        <p className="line-clamp-3 overflow-hidden text-ellipsis">
          {post.description}
        </p>
      </div>
      {canEdit && <PostModal userId={userId} post={post} />}
      <Link href={`/posts/${post.id}`} className="btn btn-primary">
        Megtekintés
      </Link>
    </div>
  );
};
