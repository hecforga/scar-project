import { createContext, useContext } from 'react';
import { User } from '@prisma/client';
import axios from 'axios';

import { MyUserCreateInput } from '../../common/model/user.model';

class UserService {
  private axiosInstance = axios.create({
    baseURL: '/api',
  });

  async create(user: MyUserCreateInput): Promise<User> {
    return (await this.axiosInstance.post<User>('user', user)).data;
  }

  async update(user: User): Promise<User> {
    return (await this.axiosInstance.put<User>('user', user)).data;
  }
}

const userService = new UserService();
const UserServiceContext = createContext<UserService>(userService);
const useUserService = (): UserService => {
  return useContext(UserServiceContext);
};

export default useUserService;
