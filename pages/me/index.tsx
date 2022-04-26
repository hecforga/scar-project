import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import { Item } from '@prisma/client';
import { Button } from 'antd';

import { getFeed } from '../api/feed';

type StaticProps = {
  feed: Item[];
};

type Props = StaticProps;

const MePage: NextPage<Props> = ({ feed }) => {
  const { data } = useSession();

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {feed.map((item) => (
        <div key={item.id}>{item.id}</div>
      ))}
      <Button type="primary" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  let feed: Item[] = [];

  if (!session) {
    res.statusCode = 403;
    return { props: { feed } };
  }

  feed = await getFeed();
  return {
    props: { feed },
  };
};

export default MePage;
