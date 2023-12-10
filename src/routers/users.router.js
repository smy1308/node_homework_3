import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

/** 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    const { email, password, name, age, gender, profileImage } = req.body;
    const isExistUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // MySQL과 연결된 Prisma 클라이언트를 통해 트랜잭션을 실행
    const [user, userInfo] = await prisma.$transaction(
      async (tx) => {
        // 트랜잭션 내부에서 사용자를 생성
        const user = await tx.users.create({
          data: {
            email,
            password: hashedPassword,
          },
        });
        // 트랜잭션 내부에서 사용자 정보를 생성
        const userInfo = await tx.userInfos.create({
          data: {
            UserId: user.userId,
            name,
            age,
            gender: gender.toUpperCase(),
            profileImage,
          },
        });
        // 콜백 함수의 리턴값으로 사용자와 사용자 정보를 반환
        return [user, userInfo];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    next(err);
  }
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findFirst({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
  }
  // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교
  else if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }
  // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성
  const token = jwt.sign(
    {
      userId: user.userId,
    },
    'customized_secret_key'
  );
  // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장
  res.cookie('authorization', `Bearer ${token}`);
  return res.json({ message: '로그인 성공' });
});

/** 사용자 조회 API **/
router.get('/users', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      UserInfos: {
        // 1:1 관계를 맺고있는 UserInfos 테이블을 조회
        select: {
          name: true,
          age: true,
          gender: true,
          profileImage: true,
        },
      },
    },
  });
  return res.json({ data: user });
});

/** 사용자 정보 변경 API **/
router.patch('/users', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const updatedData = req.body;
    // 변경 전 사용자 정보
    const userInfo = await prisma.userInfos.findFirst({
      where: { UserId: +userId },
    });
    // 트랜잭션 내부에서 사용자 정보를 수정
    await prisma.$transaction(
      async (tx) => {
        await tx.userInfos.update({
          data: {
            ...updatedData,
          },
          where: {
            UserId: userInfo.UserId,
          },
        });
        // 변경된 필드만 UseHistories 테이블에 저장
        for (let key in updatedData) {
          if (userInfo[key] !== updatedData[key]) {
            await tx.userHistories.create({
              data: {
                UserId: userInfo.UserId,
                changedField: key,
                oldValue: String(userInfo[key]),
                newValue: String(updatedData[key]),
              },
            });
          }
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
    return res.json({ message: '사용자 정보 변경에 성공하였습니다.' });
  } catch (err) {
    next(err);
  }
});

export default router;
