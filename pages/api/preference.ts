import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Genre, Preference } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getPreferences = async (
  userId: number
): Promise<
  (Preference & {
    genre: Genre;
  })[]
> => {
  return prisma.preference.findMany({
    where: {
      userId,
    },
    include: {
      genre: true,
    },
  });
};

const preference = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    res.json([]);
    return;
  }

  res.json(await getPreferences(session.user.id));
};

export default preference;
