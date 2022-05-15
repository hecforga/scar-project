import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import prisma from '../../libs/prisma';
import { MyPreference } from '../../common/model/preference.model';

export const getPreferences = async (
  userId: number
): Promise<MyPreference[]> => {
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
