import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { User } from '@prisma/client';

import prisma from '../../libs/prisma';

export const updateUser = async (user: User): Promise<User> => {
  return prisma.user.update({
    data: user,
    where: {
      id: user.id,
    },
  });
};

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (session) {
    if (req.method === 'PUT' && req.body) {
      res.json(await updateUser(req.body));
      return;
    }
  }

  res.statusCode = 400;
};

export default userHandler;
