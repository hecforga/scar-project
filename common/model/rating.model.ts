import { Genre, GenresOnItems, Item, Rating } from '@prisma/client';

export type MyRating = Rating & {
  item: Item & {
    genres: (GenresOnItems & {
      genre: Genre;
    })[];
  };
  user?: {
    age: number;
    gender: string;
    occupation: string;
  };
};

export type MyRatingWithGenreAsString = Rating & {
  item: Item & {
    genres: string[];
  };
  user?: {
    age: number;
    gender: string;
    occupation: string;
  };
};

export const getRatingsAsRecommendedItems = (
  ratings: MyRatingWithGenreAsString[]
) => {
  return ratings.map((r) => ({
    ...r.item,
    genres: r.item.genres,
    rating: r.rating,
  }));
};
