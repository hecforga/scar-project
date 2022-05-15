import { Genre, GenresOnItems, Item } from '@prisma/client';

export type MyItem = Item & {
  genres: (GenresOnItems & {
    genre: Genre;
  })[];
};

export type RecommendedItem = Item & {
  genres: string[];
  rating: number;
};
