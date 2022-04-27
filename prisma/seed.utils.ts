import { Prisma, Rating } from '@prisma/client';

import prisma from '../libs/prisma';

export type GenreCounter = {
  genreId: number;
  count: number;
};

const MAX_PREFERENCES = 5;
const MIN_PERCENTAGE = 60;

export const computeGenreCounters = async (
  userRatings: Rating[]
): Promise<GenreCounter[]> => {
  const genreMap: Record<number, number> = {};
  for (const rating of userRatings) {
    const item = await prisma.item.findUnique({
      where: {
        id: rating.itemId,
      },
      include: {
        genres: true,
      },
    });
    if (item) {
      for (const genre of item.genres) {
        if (genreMap[genre.genreId]) {
          genreMap[genre.genreId] += 1;
        } else {
          genreMap[genre.genreId] = 1;
        }
      }
    }
  }
  const genreCounters: GenreCounter[] = Object.entries(genreMap)
    .map(([key, value]) => ({
      genreId: +key,
      count: value,
    }))
    .filter((counter) => counter.count > 0)
    .sort((a, b) => b.count - a.count);
  return genreCounters;
};

export const computePreferences = async (
  userId: number,
  genreCounters: GenreCounter[]
): Promise<Prisma.PreferenceCreateInput[]> => {
  const result: Prisma.PreferenceCreateInput[] = [];
  const numberOfPreferences = Math.min(MAX_PREFERENCES, genreCounters.length);
  const multiplier =
    (100 - MIN_PERCENTAGE) /
    (genreCounters[0].count - genreCounters[numberOfPreferences - 1].count);
  for (let i = 0; i < numberOfPreferences; i++) {
    result.push({
      value: computePreferenceValue(
        genreCounters[i].count,
        genreCounters[numberOfPreferences - 1].count,
        multiplier,
        MIN_PERCENTAGE
      ),
      user: {
        connect: {
          id: userId,
        },
      },
      genre: {
        connect: {
          id: genreCounters[i].genreId,
        },
      },
    });
  }
  return result;
};

const computePreferenceValue = (
  currentCount: number,
  minCount: number,
  multiplier: number,
  minPreferenceValue: number
): number => {
  return Math.floor(
    (currentCount - minCount) * multiplier + minPreferenceValue
  );
};
