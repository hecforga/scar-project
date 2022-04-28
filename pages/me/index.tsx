import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import { Item, Neighborhood, Rating } from '@prisma/client';
import { Button } from 'antd';

import { getFeed } from '../api/feed';
import { getNeighborhood } from '../api/neighborhood';

type ServerSideProps = {
  feed: (Item & {
    ratings: Rating[];
  })[];
  neighbours: Neighborhood[];
};

type Props = ServerSideProps;

const MePage: NextPage<Props> = ({ feed, neighbours }) => {
  const { data } = useSession();

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {feed.map((item) => (
        <div key={item.id}>
          {item.id} - {item.ratings.length}
        </div>
      ))}
      <div>{JSON.stringify(neighbours)}</div>
      <Button type="primary" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({
  req,
  res,
}) => {
  const session = await getSession({ req });
  let feed: (Item & {
    ratings: Rating[];
  })[] = [];
  let neighbours: Neighborhood[] = [];

  if (session) {
    feed = await getFeed();
    neighbours = await getNeighborhood(session.user.id);
  } else {
    res.statusCode = 403;
  }

  return {
    props: { feed, neighbours },
  };
};

export default MePage;
