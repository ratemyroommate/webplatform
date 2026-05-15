import type { Post } from "@prisma/client";
import { MapPin, User } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "~/components/ui/badge";

type PostInfoProps = {
  post: Post;
  compact?: boolean;
};

export const PostInfo = ({ post, compact }: PostInfoProps) => {
  const t = useTranslations("enums");
  const tp = useTranslations("post");
  return (
    <div className="flex w-full flex-col gap-3">
      {!compact && (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">{post.price}k</span>
          <span className="text-muted-foreground text-sm">{tp("priceUnit")}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="gap-1.5">
          <MapPin size={14} />
          {t(`location.${post.location}`)}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <User size={14} />
          {t(`age.${post.age}`)}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <Image src="/gender-fluid.png" width={14} height={14} alt="" />
          {t(`gender.${post.gender}`)}
        </Badge>
      </div>
    </div>
  );
};
