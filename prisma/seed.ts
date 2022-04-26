import path from 'path';
import { PrismaClient, Prisma } from '@prisma/client';
import { readCSV, toJSON } from 'danfojs-node';

const prisma = new PrismaClient();

const dataDir = path.resolve('./public', 'data');

const main = async () => {
  console.log(`Start seeding ...`);

  await populateGenres();

  await populateItems();

  await populateUsers();

  console.log(`Seeding finished.`);
};

const populateGenres = async () => {
  const df = await readCSV(dataDir + '/genres.txt');
  const genres = toJSON(df) as Array<Record<string, string>>;

  const genreData: Prisma.GenreCreateInput[] = genres.map((genre) => ({
    name: genre.name,
  }));

  for (const g of genreData) {
    const genre = await prisma.genre.create({
      data: g,
    });
    console.log(`Created genre with id: ${genre.id}`);
  }
};

const populateItems = async () => {
  const df = await readCSV(dataDir + '/items.txt');
  const items = toJSON(df) as Array<Record<string, string>>;

  const itemData: Prisma.ItemCreateInput[] = items.map((item) => {
    const genres: Prisma.GenresOnItemsCreateNestedManyWithoutItemInput = {
      createMany: {
        data: [],
      },
    };
    for (let i = 0; i <= 18; i++) {
      if (item[`genre_${i}`] === '1') {
        (
          genres.createMany!
            .data! as Array<Prisma.GenresOnItemsCreateManyItemInput>
        ).push({
          genreId: i,
        });
      }
    }
    return {
      title: item.title,
      genres,
    };
  });

  for (const i of itemData) {
    const item = await prisma.item.create({
      data: i,
    });
    console.log(`Created item with id: ${item.id}`);
  }
};

const populateUsers = async () => {
  const df = await readCSV(dataDir + '/users.txt');
  const users = toJSON(df) as Array<Record<string, string>>;

  const userData: Prisma.UserCreateInput[] = users.map((user) => ({
    age: +user.age,
    gender: user.gender,
    occupation: user.occupation,
  }));

  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
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
