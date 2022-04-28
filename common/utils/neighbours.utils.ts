import { Genre, Preference, User } from '@prisma/client';

import { INeighbour } from '../model/neighbour.model';

export const computeNeighboursMatrix = (
  users: (User & {
    preferences: Preference[];
  })[],
  genres: Genre[]
): Record<number, INeighbour[]> => {
  const usersWithAllPreferences: number[][] = [];
  for (let user of users) {
    const allPreferences: number[] = [];
    for (let genre of genres) {
      allPreferences.push(
        user.preferences.find((p) => p.genreId === genre.id)?.value || 0
      );
    }
    usersWithAllPreferences.push(allPreferences);
  }

  const neighboursDistancesMatrix: number[][] = [];
  for (let i = 0; i < usersWithAllPreferences.length; i++) {
    const neighboursDistances: number[] = [];
    for (let j = 0; j < usersWithAllPreferences.length; j++) {
      if (i !== j) {
        neighboursDistances.push(
          pearsonDistance(usersWithAllPreferences, i, j)
        );
      } else {
        neighboursDistances.push(0);
      }
    }
    neighboursDistancesMatrix.push(neighboursDistances);
  }
  return neighboursDistancesMatrix
    .map((distances) =>
      distances
        .map((distance, i) => ({ userId: users[i].id, distance }))
        .sort((a, b) => b.distance - a.distance)
        .slice(0, 5)
    )
    .reduce(
      (previousValue, currentValue, i) => ({
        ...previousValue,
        [i + 1]: currentValue,
      }),
      {}
    );
};

const pearsonDistance = (data: number[][], i1: number, i2: number) => {
  const si: number[] = [];

  for (let i = 0; i < data[i1].length; i++) {
    si.push(i);
  }

  const n = si.length;

  if (n == 0) return 0;

  let sum1 = 0;
  for (let i of si) {
    sum1 += data[i1][i];
  }

  let sum2 = 0;
  for (let i of si) {
    sum2 += data[i2][i];
  }

  let sum1Sq = 0;
  for (let i of si) {
    sum1Sq += Math.pow(data[i1][i], 2);
  }

  let sum2Sq = 0;
  for (let i of si) {
    sum2Sq += Math.pow(data[i2][i], 2);
  }

  let pSum = 0;
  for (let i of si) {
    pSum += data[i1][i] * data[i2][i];
  }

  const num = pSum - (sum1 * sum2) / n;
  const den = Math.sqrt(
    (sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n)
  );

  if (den == 0) return 0;

  return num / den;
};
