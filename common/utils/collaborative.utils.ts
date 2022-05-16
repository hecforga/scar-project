import { Item, Rating, User } from '@prisma/client';
import { DataFrame } from 'danfojs';

import { convertGenresToString } from '../../pages/api/ratings';
import {
  getRecommendedItemsFormIds,
  MyItem,
  RecommendedItem,
} from '../model/item.model';
import { MyRatingWithGenreAsString } from '../model/rating.model';
import { MyNeighborhood } from '../model/neighborhood.model';

export const computeRecommendedItems = async (
  myRatings: MyRatingWithGenreAsString[],
  neighbours: MyNeighborhood[],
  ratings: Rating[],
  users: User[],
  items: MyItem[]
): Promise<RecommendedItem[]> => {
  const neighboursRatings = neighbours
    .map((neighbour) =>
      neighbour.rightUser.ratings.map((rating) => ({
        ...rating,
        distance: neighbour.distance,
      }))
    )
    .reduce(
      (previousValue, currentValue) => [
        ...previousValue,
        ...currentValue.map((rating) => ({
          ...rating,
          rating: rating.rating * rating.distance,
        })),
      ],
      []
    )
    .filter(
      (neighbourRating) =>
        !myRatings
          .map((rating) => rating.itemId)
          .includes(neighbourRating.itemId)
    );
  const itemsWithRating: (Item & {
    genres: string[];
    rating: number;
    times: number;
  })[] = [];
  for (let neighbourRating of neighboursRatings) {
    const itemWithRating = itemsWithRating.find(
      (item) => item.id === neighbourRating.itemId
    );
    if (itemWithRating) {
      itemWithRating.rating =
        (neighbourRating.rating + itemWithRating.rating) / 1.9;
      itemWithRating.times += 1;
    } else {
      itemsWithRating.push({
        ...neighbourRating.item,
        rating: neighbourRating.rating,
        times: 1,
      });
    }
  }

  if (itemsWithRating.length === 0) {
    const ratingsWithGenreAsString: MyRatingWithGenreAsString[] =
      convertGenresToString(
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
    const recommendedItemsIds = (
      await new DataFrame(ratingsWithGenreAsString).sample(6)
    )['itemId'].values as number[];
    return getRecommendedItemsFormIds(
      ratingsWithGenreAsString,
      recommendedItemsIds
    );
  }

  const maxTimes = [...itemsWithRating].sort((a, b) => b.times - a.times)[0]
    .times;
  for (let itemWithRating of itemsWithRating) {
    itemWithRating.rating = itemWithRating.rating * 0.95 ** maxTimes;
  }
  return [...itemsWithRating].sort((a, b) => b.rating - a.rating).slice(0, 6);
};
