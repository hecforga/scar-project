import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Genre, GenresOnItems, Item, Rating } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getRatings = async (
  userId: number
): Promise<
  (Rating & {
    item: Item & {
      genres: (GenresOnItems & {
        genre: Genre;
      })[];
    };
  })[]
> => {
  return prisma.rating.findMany({
    where: {
      userId,
    },
    include: {
      item: {
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      },
    },
  });
};

const rating = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    res.json([]);
    return;
  }

  res.json(await getRatings(session.user.id));
};

export default rating;
