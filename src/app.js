import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routers/users.router.js';
import PostsRouter from './routers/posts.router.js';
import logMiddleware from './middlewares/log.middleware.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js.js';

const app = express();
const PORT = 3018;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter], [PostsRouter]);
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});