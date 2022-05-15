import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../libs/prisma';
import { MyItem } from '../../common/model/item.model';

export const getItems = async (take?: number): Promise<MyItem[]> => {
  const args = {
    include: {
      genres: {
        include: {
          genre: true,
        },
      },
    },
    take: undefined as number | undefined,
  };
  if (take !== undefined) {
    args.take = take;
  }
  return prisma.item.findMany(args);
};

const items = async (_req: NextApiRequest, res: NextApiResponse) => {
  res.json(await getItems());
};

export default items;
