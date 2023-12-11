import { UsersRepository } from '../repositories/user.repository.js';

export class UsersService {
  usersRepository = new UsersRepository();
}
