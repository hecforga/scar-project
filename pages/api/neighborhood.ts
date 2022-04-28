import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Neighborhood } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getNeighborhood = async (
  userId: number
): Promise<Neighborhood[]> => {
  return prisma.neighborhood.findMany({
    where: {
      leftUserId: userId,
    },
    take: 5,
  });
};

const neighborhood = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    res.json([]);
    return;
  }

  res.json(await getNeighborhood(session.user.id));
};

export default neighborhood;
