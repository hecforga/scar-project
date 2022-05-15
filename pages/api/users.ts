import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { User } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

const users = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    res.json([]);
    return;
  }

  res.json(await getUsers());
};

export default users;
