import { UserService } from '../services/users.service.js';

export class UsersController {
  userService = new UserService();

  postUser = async (req, req, next) => {
    try {
      const { email, password, name, age, gender, profileImage } = req.body;
      const isExistUser = await this.userService.findFirst();

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
  };

  signUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await this.userService.findFirst(email);
      // 로그인에 성공하면, 사용자의 userId를 바탕으로 세션을 생성
      req.session.userId = user.userId;
      return res.json({ message: '로그인 성공' });
    } catch (err) {
      next(err);
    }
  };

  getUser = async (req, res, next) => {
    try {
      const { userId } = req.user;

      const user = await this.userService.findFirst(userId);

      return res.json({ data: user });
    } catch (err) {
      next(err);
    }
  };

  patchUser = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const updatedData = req.body;
      // 변경 전 사용자 정보
      const userInfo = await prisma.userInfos.findFirst(userId);
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
  };
}
