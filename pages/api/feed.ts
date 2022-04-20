import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../libs/prisma';

const feed = async (_req: NextApiRequest, res: NextApiResponse) => {
  const result = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: { author: true },
  });
  res.json(result);
};

export default feed;
