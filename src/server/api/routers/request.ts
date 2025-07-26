import { RequestStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const requestRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allRequests = await ctx.db.request.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      where: {
        OR: [
          {
            post: {
              createdById: ctx.session.user.id,
            },
          },
          {
            userId: ctx.session.user.id,
          },
        ],
      },
    });
    const recievedRequests = allRequests.filter(
      (request) => request.userId !== ctx.session.user.id,
    );
    const sentRequests = allRequests.filter(
      (request) => request.userId === ctx.session.user.id,
    );
    return { recievedRequests, sentRequests };
  }),
  update: protectedProcedure
    .input(
      z.object({ requestId: z.string(), status: z.nativeEnum(RequestStatus) }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.request.findUniqueOrThrow({
        where: { id: input.requestId },
        include: { post: true },
      });
      const isRequester = request.userId === ctx.session.user.id;
      const isPostOwner = request.post.createdById === ctx.session.user.id;
      const isAccepting = input.status === RequestStatus.ACCEPTED;

      if (isRequester && isAccepting) {
        throw new TRPCError({
          message: "Unauthorized to accept your own request",
          code: "UNAUTHORIZED",
        });
      }

      if (!isRequester && !isPostOwner) {
        throw new TRPCError({
          message: "Unauthorized to update the request",
          code: "UNAUTHORIZED",
        });
      }
      // todo: make this a transaction
      await ctx.db.request.update({
        where: { id: input.requestId },
        data: { status: input.status, modifiedById: ctx.session.user.id },
      });
      if (isAccepting) {
        await ctx.db.post.update({
          where: { id: request.postId },
          data: { featuredUsers: { connect: { id: request.userId } } },
        });
      }
    }),
  create: protectedProcedure
    .input(z.object({ postId: z.number(), comment: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUniqueOrThrow({
        where: { id: input.postId },
      });
      if (post.createdById === ctx.session.user.id)
        throw new TRPCError({
          message: "Unauthorized to request for own post",
          code: "UNAUTHORIZED",
        });

      return ctx.db.request.create({
        data: {
          postId: input.postId,
          comment: input.comment,
          userId: ctx.session.user.id,
        },
      });
    }),
});
