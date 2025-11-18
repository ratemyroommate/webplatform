import { z } from "zod";
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
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.compatibilityAnswer.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      }),
    ),
  getAnsers: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) =>
      ctx.db.compatibilityQuestionOption.findMany({
        where: { active: true },
        include: {
          answers: {
            include: {
              submittedAnswers: {
                where: { createdById: input ?? ctx.session.user.id },
              },
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      }),
    ),
  getStats: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.session.user.id;
      const postUser = input;
      const questions = await ctx.db.compatibilityQuestionOption.findMany({
        where: {
          active: true,
          submittedAnswers: {
            some: { createdById: currentUser },
          },
          AND: {
            submittedAnswers: {
              some: { createdById: postUser },
            },
          },
        },
        include: {
          submittedAnswers: {
            where: {
              createdById: { in: [currentUser, postUser] },
            },
            include: {
              answer: true,
            },
          },
        },
      });
      const stats = questions.reduce(
        (total, question) => {
          const currentUserAnswer = question.submittedAnswers.find(
            (a) => a.createdById === currentUser,
          );
          const postUserAnswer = question.submittedAnswers.find(
            (a) => a.createdById === postUser,
          );

          if (!currentUserAnswer || !postUserAnswer) return total;

          const diff = Math.abs(
            currentUserAnswer.answer.value - postUserAnswer.answer.value,
          );

          total.score += Math.max(0, 2 - diff);
          if (diff === 0) total.exactMatches += 1;
          else if (diff === 1) total.closeMatches += 1;
          else total.noMatches += 1;

          return total;
        },
        { score: 0, exactMatches: 0, closeMatches: 0, noMatches: 0 },
      );

      const totalQuestionCount = await ctx.db.compatibilityQuestionOption.count(
        { where: { active: true } },
      );

      const maxScore = totalQuestionCount * 2;
      const percentage = maxScore === 0 ? 0 : (stats.score / maxScore) * 100;
      const roundedPercentage = Math.round(percentage);

      const completedQuestionCountByCurrentUser =
        await ctx.db.compatibilityQuestionOption.count({
          where: {
            active: true,
            submittedAnswers: {
              some: {
                createdById: currentUser,
              },
            },
          },
        });

      const completedQuestionCountByPostUser =
        await ctx.db.compatibilityQuestionOption.count({
          where: {
            submittedAnswers: {
              some: {
                createdById: postUser,
              },
            },
          },
        });

      const { exactMatches, closeMatches, noMatches } = stats;
      return {
        percentage: roundedPercentage,
        exactMatches,
        closeMatches,
        noMatches,
        completedQuestionCountByCurrentUser,
        completedQuestionCountByPostUser,
        totalQuestionCount,
      };
    }),
  getCurrentUserAnswerCount: protectedProcedure.query(async ({ ctx }) => {
    const completedQuestionCountByCurrentUser =
      await ctx.db.compatibilityQuestionOption.count({
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
});
