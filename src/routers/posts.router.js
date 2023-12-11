import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { PostsController } from '../controllers/posts.controller.js';

const router = express.Router();
const postsController = new PostsController();

/** 게시글 생성 API **/
router.post('/posts', authMiddleware, postsController.createPost);
// router.post('/posts', authMiddleware, async (req, res, next) => {
//   const { userId } = req.user;
//   const { title, content } = req.body;

//   const post = await prisma.posts.create({
//     data: {
//       UserId: userId,
//       title,
//       content,
//     },
//   });
//   return res.status(201).json({ data: post });
// });

/** 게시글 목록 조회 API **/
router.get('/posts', postsController.getPosts);
// router.get('/posts', async (req, res, next) => {
//   const posts = await prisma.posts.findMany({
//     select: {
//       postId: true,
//       title: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//     orderBy: {
//       // 게시글을 최신순으로 정렬
//       createdAt: 'desc',
//     },
//   });
//   return res.json({ data: posts });
// });

/** 게시글 상세 조회 API **/
router.get('posts/:postId', postsController.getPostById);
// router.get('/posts/:postId', async (req, res, next) => {
//   const { postId } = req.params;
//   const post = await prisma.posts.findFirst({
//     where: {
//       postId: +postId,
//     },
//     select: {
//       postId: true,
//       title: true,
//       content: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });
//   return res.json({ data: post });
// });

export default router;
