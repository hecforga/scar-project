import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Rating } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getRatings = async (): Promise<Rating[]> => {
  return prisma.rating.findMany();
};

const ratings = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    res.json([]);
    return;
  }

  res.json(await getRatings());
};

export default ratings;
