import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";
import { Images } from "./Images";
import { PostInfo } from "./PostInfo";
import { useTranslations } from "next-intl";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";

type PostProps = {
  post: PostExtended;
};

export const Post = ({ post }: PostProps) => {
  const t = useTranslations("post");
  return (
    <Link href={`/posts/${post.id}`} className="group block w-full">
      <Card className="flex w-full flex-col gap-0 overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        {/* Image with price overlay */}
        <div className="relative">
          <Images images={post.images} />
          <Badge className="absolute bottom-3 left-3 z-10 gap-1 font-bold shadow-md">
            {post.price}k {t("priceShort")}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 p-4">
          <FeaturedUsers {...post} compact />
          <PostInfo post={post} compact />
        </div>
      </Card>
    </Link>
  );
};
