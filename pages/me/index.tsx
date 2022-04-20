import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import { Post } from '@prisma/client';
import { Button } from 'antd';

import prisma from '../../libs/prisma';

type StaticProps = {
  feed: Post[];
};

type Props = StaticProps;

const MePage: NextPage<Props> = ({ feed }) => {
  const { data } = useSession();

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {feed.map((post) => (
        <div key={post.id}>{post.id}</div>
      ))}
      <Button type="primary" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });

  if (!session) {
    res.statusCode = 403;
    return { props: { feed: [] } };
  }

  const feed = await prisma.post.findMany({
    where: {
      author: { id: session.user.id },
      published: true,
    },
    include: {
      author: {
        select: { id: true },
      },
    },
  });
  return {
    props: { feed },
  };
};

export default MePage;
