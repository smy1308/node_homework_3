import { PostsRepository } from '../repositories/posts.repository.js';

export class PostsService {
  postsRepository = new PostsRepository();

  createPost = async (title, content) => {
    const createdPost = await this.postsRepository.createPost(title, content);

    return {
      postId: createdPost.postId,
      title: createdPost.title,
      content: createdPost.content,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
    };
  };

  findAllPosts = async () => {
    const posts = await this.postsRepository.findAllPosts();

    posts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    return posts.map((post) => {
      return {
        postId: post.postId,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });
  };

  findPostById = async (postId) => {
    const post = await this.postsRepository.findPostById(postId);

    return {
      postId: post.postId,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  };
}
