import { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Prisma } from '@prisma/client';
import styled from 'styled-components';
import { Button, PageHeader, Result } from 'antd';

import prisma from '../libs/prisma';
import {
  computeGenreCounters,
  computePreferences,
  GenreCounter,
} from '../prisma/seed.utils';
import { getItems } from './api/items';
import { getRatings } from './api/ratings';
import { MyItem } from '../common/model/item.model';
import { computeNeighboursMatrix } from '../common/utils/neighbours.utils';
import { Footer, Header } from '../frontend/components/shared';

type StaticProps = {
  feed: MyItem[];
};

type Props = StaticProps;

const Layout = styled.div`
  display: flex;
  flex: auto;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
`;

const Content = styled.main`
  position: relative;
  flex: auto;
  margin-top: ${(props) => props.theme.headerHeight};
  min-height: ${(props) =>
    `calc(100vh - ${props.theme.headerHeight} - ${props.theme.footerHeight})`};
  min-height: ${(props) =>
    `calc(var(--vh, 1vh) * 100 - ${props.theme.headerHeight} - ${props.theme.footerHeight})`};
`;

const HomePage: NextPage<Props> = () => {
  const { data, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  return (
    <Layout>
      <Header userId={data?.user.id} signOut={signOut} />

      <Content>
        <PageHeader
          title="Bienvenido al recomendador de películas SCAR"
          subTitle="(desarrollado por Héctor Fornes Gabaldón en la UPV)"
        />

        {data ? (
          <div>
            <Result
              status="success"
              title={`Has iniciado sesión correctamente (usuario ${data.user.id})`}
              subTitle="Utilice los botones de abajo o los del menú superior para probar los diferentes recomendadores"
              extra={[
                <Link key="demographic" href="/me/demographic" passHref>
                  <Button type="default">Demográfico</Button>
                </Link>,
                <Link key="collaborative" href="/me/collaborative" passHref>
                  <Button type="default">Colaborativo</Button>
                </Link>,
              ]}
            />
          </div>
        ) : (
          <Result
            status="warning"
            title="No has iniciado sesión"
            subTitle="Utilice los siguientes botones para iniciar sesión o crear una cuenta"
            extra={[
              <a
                key="signIn"
                href={`${window.location.href}api/auth/signin?callbackUrl=${window.location.href}`}
              >
                <Button type="default">Iniciar sesión</Button>
              </a>,
              <Link key="register" href="/register" passHref>
                <Button type="default">Crear una cuenta</Button>
              </Link>,
            ]}
          />
        )}
      </Content>

      <Footer />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<StaticProps> = async () => {
  const feed = await getItems(6);

  const ratings = await getRatings();
  await prisma.preference.deleteMany();

  const usersIds = [...new Set(ratings.map((rating) => rating.userId))];
  const genreCounterMap: Record<number, GenreCounter[]> = {};
  const genresCounters = await Promise.all(
    usersIds.map((userId) => computeGenreCounters(userId, ratings))
  );
  for (let i = 0; i < usersIds.length; i++) {
    genreCounterMap[usersIds[i]] = genresCounters[i];
  }
  for (const userId of usersIds) {
    const preferencesData = computePreferences(userId, genreCounterMap[userId]);
    await Promise.all(
      preferencesData.map((p) =>
        prisma.preference.create({
          data: p,
        })
      )
    );
  }

  const users = await prisma.user.findMany({
    include: {
      preferences: true,
    },
  });
  const genres = await prisma.genre.findMany();

  const neighboursMatrix = computeNeighboursMatrix(users, genres);
  if (users.length > 0 && neighboursMatrix[users[0].id]) {
    await prisma.neighborhood.deleteMany();

    for (let user of users) {
      if (neighboursMatrix[user.id]) {
        const data: Prisma.NeighborhoodCreateManyInput[] = neighboursMatrix[
          user.id
        ].map((neighbour) => ({
          distance: neighbour.distance,
          leftUserId: user.id,
          rightUserId: neighbour.userId,
        }));
        await prisma.neighborhood.createMany({
          data,
        });
      }
    }
  }

  return {
    props: {
      feed,
    },
  };
};

export default HomePage;
