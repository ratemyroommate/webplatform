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
  getAnsers: protectedProcedure.query(({ ctx }) =>
    ctx.db.compatibilityQuestionOption.findMany({
      where: { active: true },
      include: {
        answers: {
          include: {
            submittedAnswers: { where: { createdById: ctx.session.user.id } },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    }),
  ),
});
