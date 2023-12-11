import { prisma } from '../utils/prisma/index.js';

export class PostsRepository {
  createPost = async (title, content) => {
    const createdPost = await prisma.posts.create({
      data: {
        title,
        content,
      },
    });
    return createdPost;
  };

  findAllPosts = async () => {
    const posts = await prisma.posts.findMany({
      select: {
        postId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return posts;
  };

  findPostById = async (postId) => {
    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
      },
      select: {
        postId: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return post;
  };
}
