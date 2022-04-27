import type { NextApiRequest, NextApiResponse } from 'next';
import { Item, Rating } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getFeed = async (): Promise<
  (Item & {
    ratings: Rating[];
  })[]
> => {
  return prisma.item.findMany({
    take: 5,
    include: {
      ratings: true,
    },
  });
};

const feed = async (_req: NextApiRequest, res: NextApiResponse) => {
  res.json(await getFeed());
};

export default feed;
