import * as dfd from 'danfojs-node';
import { Rating, User } from '@prisma/client';

import { MyItem, RecommendedItem } from '../model/item.model';
import { MyRating, MyRatingWithGenreAsString } from '../model/rating.model';

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

const computeQuantile = (
  df: dfd.DataFrame,
  columnName: string,
  q: number
): number => {
  const sortedValues = df.sortValues(columnName)[columnName].values;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return (
      sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base])
    );
  } else {
    return sortedValues[base];
  }
};

const convertRatingsToRecommenndedItems = (
  ratings: MyRatingWithGenreAsString[]
): RecommendedItem[] => {
  return ratings.map((rating) => ({
    ...rating.item,
    rating: rating.rating,
  }));
};

const getRecommendedItemsFormIds = (
  ratings: MyRatingWithGenreAsString[],
  recommendedItemsIds: number[]
): RecommendedItem[] => {
  let recommendedItems: RecommendedItem[] = [];
  for (let itemId of recommendedItemsIds) {
    const recommendedItem = ratings.find((rating) => rating.itemId === itemId);
    if (recommendedItem) {
      recommendedItems.push(
        convertRatingsToRecommenndedItems([recommendedItem])[0]
      );
    }
  }
  return recommendedItems;
};

export const computeRecommendedItems = async (
  user: User,
  ratings: Rating[],
  users: User[],
  items: MyItem[]
): Promise<RecommendedItem[]> => {
  let recommendedItemsIds: number[] = [];

  const myRatings: MyRatingWithGenreAsString[] = convertGenresToString(
    ratings.map((rating) => {
      const ratingUser = users.find((u) => u.id === rating.userId);
      const ratingItem = items.find((i) => i.id === rating.itemId);

      return {
        ...rating,
        user: ratingUser,
        item: ratingItem!,
      };
    })
  );

  const minAge = Math.trunc(user.age / 10) * 10;
  const maxAge = minAge + 9;
  const filteredRatings = myRatings.filter((rating) => {
    const ratingUser = users.find((u) => u.id === rating.userId);

    return (
      ratingUser &&
      rating.userId !== user.id &&
      ratingUser.age >= minAge &&
      ratingUser.age <= maxAge &&
      ratingUser.gender === user.gender &&
      ratingUser.occupation === user.occupation
    );
  });
  let ratingsDf = new dfd.DataFrame(filteredRatings);

  if (filteredRatings.length === 0) {
    recommendedItemsIds = (await new dfd.DataFrame(myRatings).sample(6))[
      'itemId'
    ].values as number[];
    return getRecommendedItemsFormIds(myRatings, recommendedItemsIds);
  }

  ratingsDf = ratingsDf
    .groupby(['itemId'])
    .agg({ rating: ['mean', 'count'] }) as dfd.DataFrame;
  const c = ratingsDf['rating_mean'].mean();
  const m = computeQuantile(ratingsDf, 'rating_count', 0.9);

  const computeWeightedRating = (row: number[]): number => {
    const v = row[2];
    const r = row[1];
    return (v / (v + m)) * r + (m / (m + v)) * c;
  };
  ratingsDf.addColumn(
    'score',
    ratingsDf.apply(computeWeightedRating).values as number[],
    { inplace: true }
  );
  ratingsDf = ratingsDf
    .sortValues('score', { ascending: false })
    .head(6) as dfd.DataFrame;
  recommendedItemsIds = ratingsDf['itemId'].values as number[];
  for (let itemId of recommendedItemsIds) {
    const recommendedItem = myRatings.find(
      (rating) => rating.itemId === itemId
    );
    if (recommendedItem) {
      recommendedItem.rating = ratingsDf.loc({
        rows: ratingsDf['itemId'].eq(recommendedItem.itemId),
      })['score'].values[0];
    }
  }
  return getRecommendedItemsFormIds(myRatings, recommendedItemsIds);
};
