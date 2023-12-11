import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';
import { CommentsController } from '../controllers/comments.controller.js';

const router = express.Router();
const commentsController = new CommentsController();

/** 댓글 생성 API **/
// router.post('/posts/:postId/comments', authMiddleware, commentsController.createComment)
router.post('/posts/:postId/comments', authMiddleware, async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.user;
  const { content } = req.body;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });
  if (!post) return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

  const comment = await prisma.comments.create({
    data: {
      UserId: +userId, // 댓글 작성자 ID
      PostId: +postId, // 댓글 작성 게시글 ID
      content: content,
    },
  });

  return res.status(201).json({ data: comment });
});

/** 댓글 조회 API **/
// router.post('/posts/:postId/comments', commentsController.getComments)
router.get('/posts/:postId/comments', async (req, res, next) => {
  const { postId } = req.params;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });
  if (!post) return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

  const comments = await prisma.comments.findMany({
    where: {
      PostId: +postId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.json({ data: comments });
});

export default router;
