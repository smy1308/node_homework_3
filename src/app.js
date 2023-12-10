import express from 'express';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import expressMySQLSession from 'express-mysql-session';
import UsersRouter from './routers/users.router.js';
import PostsRouter from './routers/posts.router.js';
import CommentsRouter from './routers/comments.router.js';
import logMiddleware from './middlewares/log.middleware.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.SERVER_PORT;

const MySQLStore = expressMySQLSession(expressSession);
// MySQLStore를 이용해 세션 외부 스토리지를 선언
const sessionStore = new MySQLStore({
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  expiration: 1000 * 60 * 60 * 24, // 세션 만료 기간 1일
  createDatabaseTable: true, // 세션 테이블 자동생성
});

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET_KEY, // 세션을 암호화 비밀 키
    resave: false, // 요청이 올 때마다 세션을 새롭게 저장할 지 설정
    saveUninitialized: false, // 세션이 초기화되지 않았을 때 세션을 저장할 지 설정
    store: sessionStore, // 외부 세션 스토리지를 MySQLStore로 설정
    cookie: {
      // 세션 쿠키 설정
      maxAge: 1000 * 60 * 60 * 24, // 쿠키의 만료 기간 1일
    },
  })
);
app.use('/api', [UsersRouter], [PostsRouter], [CommentsRouter]);
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log('포트로 서버가 열렸어요!');
});
