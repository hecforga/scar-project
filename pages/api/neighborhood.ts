import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import {
  Genre,
  GenresOnItems,
  Item,
  Neighborhood,
  Rating,
  User,
} from '@prisma/client';

import prisma from '../../libs/prisma';

export const getNeighborhood = async (
  userId: number
): Promise<
  (Neighborhood & {
    rightUser: User & {
      ratings: (Rating & {
        item: Item & {
          genres: (GenresOnItems & {
            genre: Genre;
          })[];
        };
      })[];
    };
  })[]
> => {
  return prisma.neighborhood.findMany({
    where: {
      leftUserId: userId,
    },
    include: {
      rightUser: {
        include: {
          ratings: {
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
          },
        },
      },
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
