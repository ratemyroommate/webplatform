import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { compatibilityKvizQuestions } from "~/utils/helpers";

export const kvizRouter = createTRPCRouter({
  getQuestionIndex: protectedProcedure.query(async ({ ctx }) =>
    ctx.db.compatibilityAnswers.count({
      where: { createdById: ctx.session.user.id },
    }),
  ),
  saveAnswer: protectedProcedure
    .input(
      z.object({
        questionIndex: z.number().min(0).max(compatibilityKvizQuestions.length),
        answerIndex: z.number().min(0).max(4),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.compatibilityAnswers.create({
        data: {
          questionIndex: input.questionIndex,
          answerIndex: input.answerIndex,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      }),
    ),
  getAnsers: protectedProcedure.query(({ ctx }) =>
    ctx.db.compatibilityAnswers.findMany({
      where: { createdById: ctx.session.user.id },
    }),
  ),
});
