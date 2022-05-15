import { User } from '@prisma/client';
import axios from 'axios';
import { createContext, useContext } from 'react';

class UserService {
  private axiosInstance = axios.create({
    baseURL: '/api',
  });

  async update(user: User): Promise<User> {
    return this.axiosInstance.put('user', user);
  }
}

const userService = new UserService();
const UserServiceContext = createContext<UserService>(userService);
const useUserService = (): UserService => {
  return useContext(UserServiceContext);
};

export default useUserService;
