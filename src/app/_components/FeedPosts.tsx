import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Post } from "./post";
import { PostSkeletons } from "./PostSkeletons";
import type { FormValues } from "./Filters";
import { useTranslations } from "next-intl";
import { EndOfList } from "~/components/ui/end-of-list";

type FeedPostsProps = { filters: FormValues };

export const FeedPosts = ({ filters }: FeedPostsProps) => {
  const bottom = useRef<HTMLDivElement>(null);
  const t = useTranslations("post");
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    api.post.getLatest.useInfiniteQuery(
      { filters },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage) void fetchNextPage();
    });
    if (bottom.current) observer.observe(bottom.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return (
    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
      {data?.pages.map((page) => page.posts.map((post) => <Post post={post} key={post.id} />))}
      {(isLoading || isFetchingNextPage) && <PostSkeletons />}
      {!hasNextPage && (
        <div className="col-span-full">
          <EndOfList title={t("endOfFeedTitle")} subtitle={t("endOfFeedSubtitle")} />
        </div>
      )}
      <div ref={bottom} className="col-span-full" />
    </div>
  );
};
