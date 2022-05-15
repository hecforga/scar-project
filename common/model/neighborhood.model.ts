import { Neighborhood, User } from '@prisma/client';

import { MyRatingWithGenreAsString } from './rating.model';

export type MyNeighborhood = Neighborhood & {
  rightUser: User & {
    ratings: MyRatingWithGenreAsString[];
  };
};

export type INeighbour = {
  userId: number;
  distance: number;
};
