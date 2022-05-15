import { Genre, Preference } from '@prisma/client';

export type MyPreference = Preference & {
  genre: Genre;
};
