import { z } from "zod";
import type { CompatibilityCategory } from "@prisma/client";
import { COMPATIBILITY_CATEGORIES } from "~/utils/compatibility";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const kvizRouter = createTRPCRouter({
  getQuestion: protectedProcedure.query(async ({ ctx }) => {
    const question = await ctx.db.compatibilityQuestionOption.findFirst({
      where: {
        active: true,
        submittedAnswers: {
          none: {
            createdById: ctx.session.user.id,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
      include: {
        answers: true,
      },
    });
    const questionIndex = await ctx.db.compatibilityQuestionOption.count({
      where: {
        active: true,
        submittedAnswers: {
          some: {
            createdById: ctx.session.user.id,
          },
        },
      },
    });
    const totalQuestionCount = await ctx.db.compatibilityQuestionOption.count({
      where: {
        active: true,
      },
    });
    return { question, questionIndex, totalQuestionCount };
  }),
  saveAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.number().min(0),
        answerId: z.number().min(0),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.db.compatibilityAnswer.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      })
    ),
  /**
   * Answered questions for a user (defaults to the current user) plus the
   * per-category style profile derived from those answers. Single query so the
   * Completed Quiz view can render both donuts and the answer list in one hop.
   */
  getAnswers: protectedProcedure.input(z.string().optional()).query(async ({ ctx, input }) => {
    const userId = input ?? ctx.session.user.id;
    const questions = await ctx.db.compatibilityQuestionOption.findMany({
      where: { active: true },
      include: {
        answers: {
          include: {
            submittedAnswers: {
              where: { createdById: userId },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const byCategory = new Map<
      CompatibilityCategory,
      { total: number; max: number; answered: number; questionCount: number }
    >();
    for (const cat of COMPATIBILITY_CATEGORIES) {
      byCategory.set(cat, { total: 0, max: 0, answered: 0, questionCount: 0 });
    }

    for (const q of questions) {
      const bucket = byCategory.get(q.category);
      if (!bucket) continue;
      bucket.questionCount += 1;
      bucket.max += 2; // value range 0..2 per question
      const picked = q.answers.find((a) => a.submittedAnswers.length > 0);
      if (picked) {
        bucket.total += picked.value;
        bucket.answered += 1;
      }
    }

    const profile = COMPATIBILITY_CATEGORIES.map((cat) => {
      const b = byCategory.get(cat)!;
      return {
        category: cat,
        total: b.total,
        max: b.max,
        answered: b.answered,
        questionCount: b.questionCount,
      };
    });

    return { questions, profile };
  }),
  /**
   * Pairwise compatibility stats between the current user and `input` (target user):
   * overall percentage + match counts and a per-category breakdown derived from
   * the same question set. Also returns completion counts so the UI can prompt
   * either user to fill the quiz.
   *
   * `percentage` is `null` for categories where no question has been answered
   * by both users — distinguishes "no shared data" from a genuine 0% match.
   */
  getStats: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const currentUser = ctx.session.user.id;
    const postUser = input;

    const [
      questions,
      totalQuestionCount,
      completedQuestionCountByCurrentUser,
      completedQuestionCountByPostUser,
    ] = await Promise.all([
      ctx.db.compatibilityQuestionOption.findMany({
        where: {
          active: true,
          submittedAnswers: { some: { createdById: currentUser } },
          AND: { submittedAnswers: { some: { createdById: postUser } } },
        },
        select: {
          id: true,
          category: true,
          submittedAnswers: {
            where: { createdById: { in: [currentUser, postUser] } },
            select: { createdById: true, answer: { select: { value: true } } },
          },
        },
      }),
      ctx.db.compatibilityQuestionOption.count({ where: { active: true } }),
      ctx.db.compatibilityQuestionOption.count({
        where: { active: true, submittedAnswers: { some: { createdById: currentUser } } },
      }),
      ctx.db.compatibilityQuestionOption.count({
        where: { submittedAnswers: { some: { createdById: postUser } } },
      }),
    ]);

    type MatchKey = "exact" | "close" | "opposite";
    type Scored = { id: number; category: CompatibilityCategory; points: number; match: MatchKey };

    // 1. Score every question both users answered; drop the rest.
    const scored: Scored[] = questions.flatMap((q) => {
      const me = q.submittedAnswers.find((a) => a.createdById === currentUser);
      const other = q.submittedAnswers.find((a) => a.createdById === postUser);
      if (!me || !other) return [];
      const diff = Math.abs(me.answer.value - other.answer.value);
      const match: MatchKey = diff === 0 ? "exact" : diff === 1 ? "close" : "opposite";
      return [{ id: q.id, category: q.category, points: Math.max(0, 2 - diff), match }];
    });

    // 2. Aggregate any list of scored questions into a bucket of counts.
    type Bucket = {
      score: number;
      max: number;
      exact: number;
      close: number;
      opposite: number;
      questionIds: number[];
    };
    const aggregate = (items: Scored[]): Bucket =>
      items.reduce<Bucket>(
        (acc, item) => {
          acc.score += item.points;
          acc.max += 2;
          acc[item.match] += 1;
          acc.questionIds.push(item.id);
          return acc;
        },
        { score: 0, max: 0, exact: 0, close: 0, opposite: 0, questionIds: [] }
      );

    // 3. Shape per-category + overall results.
    const toPercentage = (score: number, max: number) =>
      max === 0 ? null : Math.round((score / max) * 100);

    const categories = COMPATIBILITY_CATEGORIES.map((category) => {
      const bucket = aggregate(scored.filter((s) => s.category === category));
      return { category, percentage: toPercentage(bucket.score, bucket.max), ...bucket };
    });

    const overall = aggregate(scored);
    const percentage = toPercentage(overall.score, totalQuestionCount * 2) ?? 0;

    return {
      percentage,
      exactMatches: overall.exact,
      closeMatches: overall.close,
      noMatches: overall.opposite,
      completedQuestionCountByCurrentUser,
      completedQuestionCountByPostUser,
      totalQuestionCount,
      categories,
    };
  }),
  getCurrentUserAnswerCount: protectedProcedure.query(async ({ ctx }) => {
    const completedQuestionCountByCurrentUser = await ctx.db.compatibilityQuestionOption.count({
      where: {
        active: true,
        submittedAnswers: {
          some: {
            createdById: ctx.session.user.id,
          },
        },
      },
    });
    const totalQuestionCount = await ctx.db.compatibilityQuestionOption.count({
      where: { active: true },
    });

    return { completedQuestionCountByCurrentUser, totalQuestionCount };
  }),

  /**
   * Side-by-side answers for two users across a specified set of question ids.
   * Used by the CompatibilityScore accordion drill-down.
   */
  getPairAnswers: protectedProcedure
    .input(z.object({ userId: z.string(), questionIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      if (input.questionIds.length === 0) return [];
      return ctx.db.compatibilityQuestionOption.findMany({
        where: { id: { in: input.questionIds } },
        orderBy: { order: "asc" },
        include: {
          answers: {
            include: {
              submittedAnswers: {
                where: {
                  createdById: { in: [ctx.session.user.id, input.userId] },
                },
              },
            },
          },
        },
      });
    }),
});
