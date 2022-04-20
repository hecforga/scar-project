import path from 'path';
import { PrismaClient, Prisma, User } from '@prisma/client';
import { readCSV, toJSON } from 'danfojs-node';

const prisma = new PrismaClient();

const main = async () => {
  console.log(`Start seeding ...`);

  const dataDir = path.resolve('./public', 'data');
  const df = await readCSV(dataDir + '/users.txt');
  const users = toJSON(df) as Array<User>;

  const userData: Prisma.UserCreateInput[] = users.map((u) => ({
    ...u,
    posts: {},
  }));
  populatePosts(userData);

  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const populatePosts = (
  userData: Prisma.UserCreateInput[]
): Prisma.UserCreateInput[] => {
  if (userData[0]) {
    userData[0].posts = {
      create: [
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          published: true,
        },
      ],
    };
  }
  if (userData[1]) {
    userData[1].posts = {
      create: [
        {
          title: 'Follow Prisma on Twitter',
          content: 'https://www.twitter.com/prisma',
          published: true,
        },
      ],
    };
  }
  if (userData[2]) {
    userData[2].posts = {
      create: [
        {
          title: 'Ask a question about Prisma on GitHub',
          content: 'https://www.github.com/prisma/prisma/discussions',
          published: true,
        },
      ],
    };
  }
  return userData;
};
