import { PostsService } from '../services/posts.service.js';

export class PostsController {
  postsService = new PostsService();

  createPost = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { title, content } = req.body;

      const createdPost = await this.postsService.createPost({
        data: {
          UserId: userId,
          title,
          content,
        },
      });
      return res.status(201).json({ data: createdPost });
    } catch (err) {
      next();
    }
  };

  getPosts = async (req, res, next) => {
    try {
      const posts = await this.postsService.findAllPosts();

      return res.json({ data: posts });
    } catch (err) {
      next(err);
    }
  };

  getPostById = async (req, res, next) => {
    try {
      const { postId } = req.params;

      const post = await this.postsService.findPostById(postId);

      return res.json({ data: post });
    } catch (err) {
      next(err);
    }
  };
}
