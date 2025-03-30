import { RequestStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const requestRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.db.request.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      where: {
        post: {
          createdById: ctx.session.user.id,
        },
      },
    }),
  ),
  update: protectedProcedure
    .input(
      z.object({ requestId: z.string(), status: z.nativeEnum(RequestStatus) }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.request.findUniqueOrThrow({
        where: { id: input.requestId },
        include: { post: true },
      });
      // todo: requested user should be able to modify this also
      if (request.post.createdById !== ctx.session.user.id)
        throw new TRPCError({
          message: "Unauthorized to update the request",
          code: "UNAUTHORIZED",
        });
      // todo: make this a transaction
      await ctx.db.request.update({
        where: { id: input.requestId },
        data: { status: input.status, modifiedById: ctx.session.user.id },
      });
      if (input.status === RequestStatus.ACCEPTED) {
        await ctx.db.post.update({
          where: { id: request.postId },
          data: { featuredUsers: { connect: { id: request.userId } } },
        });
      }
    }),
  create: protectedProcedure
    .input(z.object({ postId: z.number(), comment: z.string().nullable() }))
    .mutation(({ ctx, input }) =>
      ctx.db.request.create({
        data: {
          postId: input.postId,
          comment: input.comment,
          userId: ctx.session.user.id,
        },
      }),
    ),
});
