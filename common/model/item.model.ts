import { Genre, GenresOnItems, Item } from '@prisma/client';
import { MyRatingWithGenreAsString } from './rating.model';

export type MyItem = Item & {
  genres: (GenresOnItems & {
    genre: Genre;
  })[];
};

export type RecommendedItem = Item & {
  genres: string[];
  rating: number;
};

export const getRecommendedItemsFormIds = (
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
  return [...recommendedItems].sort((a, b) => b.rating - a.rating);
};

const convertRatingsToRecommenndedItems = (
  ratings: MyRatingWithGenreAsString[]
): RecommendedItem[] => {
  return ratings.map((rating) => ({
    ...rating.item,
    rating: rating.rating,
  }));
};
