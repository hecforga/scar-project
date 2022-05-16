import { Prisma } from '@prisma/client';

export type MyUserCreateInput = {
  age?: number;
  gender?: string;
  occupation?: string;
  ratings?: Prisma.RatingCreateNestedManyWithoutUserInput;
};
