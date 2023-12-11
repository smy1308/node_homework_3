import { prisma } from '../utils/prisma/index.js';

export class CommentsRepository {
  createComment = async (postId, content) => {
    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
      },
    });

    const createComment = await prisma.comments.create({
      data: {
        UserId: +userId,
        PostId: +postId,
        content: content,
      },
    });
    return createComment;
  };

  findComments = async (postId) => {
    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
      },
    });

    const comments = await prisma.comments.findMany({
      where: {
        PostId: +postId,
      },
    });
    return comments;
  };
}
