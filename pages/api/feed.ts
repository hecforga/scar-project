import type { NextApiRequest, NextApiResponse } from 'next';
import { Post, User } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getFeed = async (): Promise<
  (Post & { author: User | null })[]
> => {
  return prisma.post.findMany({
    where: {
      published: true,
    },
    include: { author: true },
  });
};

export const getMyFeed = async (
  userId: number
): Promise<(Post & { author: User | null })[]> => {
  return prisma.post.findMany({
    where: {
      published: true,
      author: { id: userId },
    },
    include: { author: true },
  });
};

const feed = async (_req: NextApiRequest, res: NextApiResponse) => {
  res.json(await getFeed());
};

export default feed;
