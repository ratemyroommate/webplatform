import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Post } from "./post";
import { PostSkeletons } from "./PostSkeletons";
import { FormValues } from "./Filters";

type FeedPostsProps = { filters: FormValues; userId?: string };

export const FeedPosts = ({ filters, userId }: FeedPostsProps) => {
  const bottom = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, isLoading } =
    api.post.getLatest.useInfiniteQuery(
      { filters },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) fetchNextPage();
    });
    if (bottom.current) observer.observe(bottom.current);
  }, []);

  return (
    <>
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <Post post={post} key={post.id} userId={userId} />
        )),
      )}
      {isLoading && <PostSkeletons />}
      <div ref={bottom} />
    </>
  );
};
