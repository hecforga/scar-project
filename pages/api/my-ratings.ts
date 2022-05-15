import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import prisma from '../../libs/prisma';
import { MyRating } from '../../common/model/rating.model';

export const getMyRatings = async (userId: number): Promise<MyRating[]> => {
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

export const convertGenresToString = (ratings: MyRating[]) => {
  return ratings.map((rating) => ({
    ...rating,
    item: {
      id: rating.item.id,
      title: rating.item.title,
      genres: rating.item.genres.map((genre) => genre.genre.name),
    },
  }));
};

const myRatings = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    res.json([]);
    return;
  }

  res.json(await getMyRatings(session.user.id));
};

export default myRatings;
