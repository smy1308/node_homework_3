import { CommentsService } from '../services/comments.service';
import { PostsService } from '../services/posts.service.js';

export class CommentsController {
  postsService = new PostsService();
  commentsService = new CommentsService();

  createComment = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;
      const { content } = req.body;

      const post = await this.postsService.findPostById(postId);
      const comment = await this.commentsService.createComment({
        data: {
          UserId: +userId,
          PostId: +postId,
          content: content,
        },
      });
      return res.status(201).json({ data: comment });
    } catch (err) {
      next();
    }
  };

  getComments = async (req, res, next) => {
    try {
      const { postId } = req.params;

      const post = await this.commentsService.findPostById(postId);
      const comments = await this.commentsService.findComments();

      return res.json({ data: comments });
    } catch (err) {
      next(err);
    }
  };
}
