import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Rating } from '@prisma/client';

import prisma from '../../libs/prisma';
import { MyRating } from '../../common/model/rating.model';

export const getRatings = async (): Promise<Rating[]> => {
  return prisma.rating.findMany();
};

export const convertGenresToString = (ratingss: MyRating[]) => {
  return ratingss.map((rating) => ({
    ...rating,
    item: {
      id: rating.item.id,
      title: rating.item.title,
      genres: rating.item.genres.map((genre) => genre.genre.name),
    },
  }));
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
