import path from 'path';
import { PrismaClient, Prisma, Rating } from '@prisma/client';
import { readCSV, toJSON } from 'danfojs-node';

import { JSONObject } from '../common/model/json.model';
import {
  computeGenreCounters,
  computePreferences,
  GenreCounter,
} from './seed.utils';

const prisma = new PrismaClient();

const dataDir = path.resolve('./public', 'data');

const main = async () => {
  console.log(`Start seeding ...`);

  await populateGenres();

  await populateItems();

  await populateUsers();

  await populateRatings();

  console.log(`Seeding finished.`);
};

const populateGenres = async () => {
  const df = await readCSV(dataDir + '/genres.txt');
  const genres = toJSON(df) as Array<JSONObject>;

  const genreData: Prisma.GenreCreateInput[] = genres.map((genre) => ({
    name: genre.name as string,
  }));

  for (const g of genreData) {
    await prisma.genre.create({
      data: g,
    });
  }
};

const populateItems = async () => {
  const df = await readCSV(dataDir + '/items.txt');
  const items = toJSON(df) as Array<JSONObject>;

  const itemData: Prisma.ItemCreateInput[] = items.map((item) => {
    const genres: Prisma.GenresOnItemsCreateNestedManyWithoutItemInput = {
      createMany: {
        data: [],
      },
    };
    for (let i = 0; i <= 18; i++) {
      const index = `genre_${i}`;
      if (item[index]) {
        (
          genres.createMany!
            .data as Array<Prisma.GenresOnItemsCreateManyItemInput>
        ).push({
          genreId: i + 1,
        });
      }
    }
    return {
      title: item.title as string,
      genres,
    };
  });

  for (const i of itemData) {
    await prisma.item.create({
      data: i,
    });
  }
};

const populateUsers = async () => {
  const df = await readCSV(dataDir + '/users.txt');
  const users = toJSON(df) as Array<JSONObject>;

  const userData: Prisma.UserCreateInput[] = users.map((user) => ({
    age: user.age as number,
    gender: user.gender as string,
    occupation: user.occupation as string,
  }));

  for (const u of userData) {
    await prisma.user.create({
      data: u,
    });
  }
};

const populateRatings = async () => {
  const df = await readCSV(dataDir + '/u1_base.txt');
  const ratingsJson = toJSON(df) as Array<JSONObject>;

  const ratingData: Prisma.RatingCreateInput[] = ratingsJson.map((rating) => ({
    rating: rating.rating as number,
    user: {
      connect: {
        id: rating.user_id as number,
      },
    },
    item: {
      connect: {
        id: rating.item_id as number,
      },
    },
  }));

  const ratings: Rating[] = [];
  for (const r of ratingData) {
    const rating = await prisma.rating.create({
      data: r,
    });
    ratings.push(rating);
  }

  const userIds = [...new Set(ratings.map((rating) => rating.userId))];
  const genreCounterMap: Record<number, GenreCounter[]> = {};
  for (const userId of userIds) {
    const userRatings = ratings.filter((rating) => rating.userId === userId);
    genreCounterMap[userId] = await computeGenreCounters(userRatings);
  }
  for (const userId of userIds) {
    const preferencesData = await computePreferences(
      userId,
      genreCounterMap[userId]
    );
    for (const p of preferencesData) {
      await prisma.preference.create({
        data: p,
      });
    }
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
