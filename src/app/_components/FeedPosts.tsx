import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Post } from "./post";
import { PostSkeletons } from "./PostSkeletons";
import { FormValues } from "./Filters";

type FeedPostsProps = { filters: FormValues };

export const FeedPosts = ({ filters }: FeedPostsProps) => {
  const bottom = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, isLoading, isFetchingNextPage } =
    api.post.getLatest.useInfiniteQuery(
      { filters },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void fetchNextPage();
    });
    if (bottom.current) observer.observe(bottom.current);
  }, []);

  return (
    <>
      {data?.pages.map((page) =>
        page.posts.map((post) => <Post post={post} key={post.id} />),
      )}
      {(isLoading || isFetchingNextPage) && <PostSkeletons />}
      <div ref={bottom} />
    </>
  );
};
