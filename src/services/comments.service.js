import { CommentsRepository } from '../repositories/comments.repository.js';
import { PostsRepository } from '../repositories/posts.repository.js';

export class CommentsService {
  commentsRepository = new CommentsRepository();
  postsRepository = new PostsRepository();

  createComment = async (postId, content) => {
    const post = await this.postsRepository.findPostById(postId);
    const createComment = await this.commentsRepository.createComment(content);

    if (!post) return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

    return {
      content: createComment.content,
    };
  };

  findComments = async (postId) => {
    const post = await this.postsRepository.findPostById(postId);
    const comments = await this.commentsRepository.findComments();

    if (!post) return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

    comments.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    return comments;
  };
}
