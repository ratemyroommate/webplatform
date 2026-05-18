/**
 * Skeleton fixtures consumed by Boneyard's `npx boneyard-js build` CLI.
 *
 * Each fixture mirrors the real loaded UI for a `<Skeleton name="...">` site.
 * The CLI snapshots these to derive bone rectangles; they're not shown at runtime.
 */
import { Card } from "~/components/ui/card";

export const PostCardFixture = () => (
  <div className="block w-full">
    <div
      className="bg-muted relative overflow-hidden rounded-[var(--radius)]"
      style={{ aspectRatio: "3 / 4" }}
    />
    <div className="pt-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-[14.5px] w-2/3 rounded bg-[color:var(--ink-10)]" />
          <div className="mt-1 h-[12.5px] w-1/2 rounded bg-[color:var(--ink-10)]" />
        </div>
        <div className="h-[12px] w-8 rounded bg-[color:var(--ink-10)]" />
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex -space-x-1.5">
          <div className="ring-background size-6 rounded-full bg-[color:var(--ink-10)] ring-2" />
          <div className="ring-background size-6 rounded-full bg-[color:var(--ink-10)] ring-2" />
          <div className="ring-background size-6 rounded-full bg-[color:var(--ink-10)] ring-2" />
        </div>
        <div className="h-[12px] w-10 rounded bg-[color:var(--ink-10)]" />
      </div>
    </div>
  </div>
);

export const CompatScoreFixture = () => (
  <Card className="p-4">
    <div className="flex">
      <div className="flex flex-col gap-1">
        <div className="h-3 w-24 rounded bg-[color:var(--ink-10)]" />
        <div className="h-9 w-20 rounded bg-[color:var(--ink-10)]" />
        <div className="mt-1 h-5 w-28 rounded bg-[color:var(--ink-10)]" />
      </div>
      <div className="ml-auto flex flex-col items-end gap-1">
        <div className="h-6 w-24 rounded bg-[color:var(--ink-10)]" />
        <div className="h-6 w-24 rounded bg-[color:var(--ink-10)]" />
        <div className="h-6 w-24 rounded bg-[color:var(--ink-10)]" />
      </div>
    </div>
  </Card>
);

export const KvizQuestionFixture = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="h-3 w-12 rounded bg-[color:var(--ink-10)]" />
        <div className="h-3 w-10 rounded bg-[color:var(--ink-10)]" />
      </div>
      <div className="flex w-full items-center gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-[color:var(--ink-10)]" />
        ))}
      </div>
    </div>
    <div className="bg-card flex flex-col gap-5 rounded-2xl border border-[color:var(--ink-10)] p-6">
      <div className="h-6 w-2/3 rounded bg-[color:var(--ink-10)]" />
      <div className="flex flex-col gap-2">
        <div className="h-12 rounded-xl bg-[color:var(--ink-10)]" />
        <div className="h-12 rounded-xl bg-[color:var(--ink-10)]" />
        <div className="h-12 rounded-xl bg-[color:var(--ink-10)]" />
      </div>
    </div>
    <div className="h-10 w-40 self-end rounded bg-[color:var(--ink-10)]" />
  </div>
);

export const NotificationListFixture = () => (
  <div className="flex flex-col gap-2">
    <NotificationRowFixture />
    <NotificationRowFixture />
    <NotificationRowFixture />
  </div>
);

const NotificationRowFixture = () => (
  <Card className="gap-2 p-3">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-full bg-[color:var(--ink-10)]" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-3.5 w-1/2 rounded bg-[color:var(--ink-10)]" />
        <div className="h-3 w-1/3 rounded bg-[color:var(--ink-10)]" />
      </div>
      <div className="h-8 w-8 rounded bg-[color:var(--ink-10)]" />
      <div className="h-8 w-8 rounded bg-[color:var(--ink-10)]" />
    </div>
  </Card>
);
