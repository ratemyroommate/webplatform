import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";
import { PostModal } from "./PostModal";
import { Carousel } from "./Carousel";
import { PostPrice } from "./PostPrice";

type PostProps = {
  post: PostExtended;
  userId?: string;
};

export const Post = ({ post, userId }: PostProps) => {
  const canEdit = userId === post.createdById;

  return (
    <div className="card flex w-full flex-col items-center justify-between gap-6 bg-base-100 p-4 shadow-xl sm:flex-row">
      <Carousel images={post.images} id={post.id} />
      <div className="flex w-full flex-col gap-6">
        <FeaturedUsers {...post} />
        <PostPrice price={post.price} />
      </div>
      <div className="flex w-full flex-col gap-2">
        {canEdit && <PostModal userId={userId} post={post} />}
        <Link href={`/posts/${post.id}`} className="btn btn-primary w-full">
          Megtekintés
        </Link>
      </div>
    </div>
  );
};
