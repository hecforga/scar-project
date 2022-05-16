import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Prisma, User } from '@prisma/client';

import prisma from '../../libs/prisma';

const createUser = async (user: Prisma.UserCreateInput): Promise<User> => {
  return prisma.user.create({
    data: user,
  });
};

const updateUser = async (user: User): Promise<User> => {
  return prisma.user.update({
    data: user,
    where: {
      id: user.id,
    },
  });
};

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (req.method === 'POST' && req.body) {
    res.json(await createUser(req.body));
    return;
  }

  if (session) {
    if (req.method === 'PUT' && req.body) {
      res.json(await updateUser(req.body));
      return;
    }
  }

  return res.status(400).send('Bad Request');
};

export default userHandler;
