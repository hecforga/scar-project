import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Genre, GenresOnItems, Item, Rating } from '@prisma/client';

import prisma from '../../libs/prisma';

export const getRatings = async (): Promise<
  (Rating & {
    item: Item & {
      genres: (GenresOnItems & {
        genre: Genre;
      })[];
    };
    user: {
      age: number;
      gender: string;
      occupation: string;
    };
  })[]
> => {
  return prisma.rating.findMany({
    include: {
      user: {
        select: {
          age: true,
          gender: true,
          occupation: true,
        },
      },
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

const ratings = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    res.json([]);
    return;
  }

  res.json(await getRatings());
};

export default ratings;
