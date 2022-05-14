import { Item } from '@prisma/client';

export type RecommendedItem = Item & {
  genres: string[];
  rating: number;
};
