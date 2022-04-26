import type { NextApiRequest, NextApiResponse } from 'next';
import { Item } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getFeed = async (): Promise<Item[]> => {
  return prisma.item.findMany({
    take: 5,
  });
};

const feed = async (_req: NextApiRequest, res: NextApiResponse) => {
  res.json(await getFeed());
};

export default feed;
