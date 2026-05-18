"use client";

/**
 * Capture target for `npx boneyard-js build`.
 *
 * Renders every named `<Skeleton>` in the app with `loading={false}` so the
 * children (which mirror the loaded UI) are present in the DOM for the CLI
 * to snapshot. Bones are keyed globally by `name`, so once captured they
 * apply everywhere the same name is used at runtime.
 *
 * Not user-facing. Lives outside the `(main)` route group so there's no
 * navbar/footer chrome interfering with capture.
 */
import { Skeleton } from "boneyard-js/react";
import {
  CompatScoreFixture,
  KvizQuestionFixture,
  NotificationListFixture,
  PostCardFixture,
} from "~/app/_components/skeleton-fixtures";

export default function SkeletonCapturePage() {
  return (
    <main className="bg-background mx-auto flex max-w-[1240px] flex-col gap-12 p-6">
      <section style={{ width: 280 }}>
        <Skeleton name="post-card" loading={false}>
          <PostCardFixture />
        </Skeleton>
      </section>

      <section style={{ width: 380 }}>
        <Skeleton name="compat-score" loading={false}>
          <CompatScoreFixture />
        </Skeleton>
      </section>

      <section style={{ width: 720 }}>
        <Skeleton name="kviz-question" loading={false}>
          <KvizQuestionFixture />
        </Skeleton>
      </section>

      <section style={{ width: 380 }}>
        <Skeleton name="notification-list" loading={false}>
          <NotificationListFixture />
        </Skeleton>
      </section>
    </main>
  );
}
