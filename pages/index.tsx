import { useEffect } from 'react';
import { GetStaticProps, NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import { Prisma } from '@prisma/client';
import styled, { DefaultTheme, withTheme } from 'styled-components';
import debounce from 'lodash.debounce';

import prisma from '../libs/prisma';
import { getItems } from './api/items';
import { MyItem } from '../common/model/item.model';
import { INeighbour } from '../common/model/neighborhood.model';
import { computeNeighboursMatrix } from '../common/utils/neighbours.utils';
import { Footer, Header, ProfileForm } from '../frontend/components/shared';

type StaticProps = {
  feed: MyItem[];
  neighboursMatrix: Record<number, INeighbour[]>;
};

type Props = StaticProps & {
  theme: DefaultTheme;
};

const layoutId = 'scarLayoutId';
const registerSectionId = 'scarRegisterSection';
const scrollableSectionId = 'scarScrollableSection';

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

const RegisterSection = styled.div`
  background-color: grey;
  position: fixed;
  top: ${(props) => props.theme.headerHeight};
  bottom: 0;
  left: ${(props) => props.theme.grid.getGridColumns(14, -1)};
  right: 0;
  z-index: 10;
`;

const ScrollableSection = styled.div`
  position: relative;
  width: ${(props) => props.theme.grid.getGridColumns(14, -1)};
  background-color: white;
  z-index: 20;
`;

const HomePage: NextPage<Props> = ({ feed, neighboursMatrix, theme }) => {
  const { data } = useSession();

  const register = () => {
    console.log('register');
  };

  const handleScroll = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const headerHeight = +theme.headerHeight.replace('px', '');
    const footerHeight = +theme.footerHeight.replace('px', '');

    const layoutElement = document.getElementById(layoutId);

    const registerSectionElement = document.getElementById(registerSectionId);
    if (layoutElement && registerSectionElement) {
      const ammountOfHeaderVisible = headerHeight - window.scrollY;
      if (ammountOfHeaderVisible > 0) {
        registerSectionElement.style.setProperty(
          'top',
          `${ammountOfHeaderVisible}px`
        );
      }
      if (ammountOfHeaderVisible <= 0) {
        registerSectionElement.style.setProperty('top', '0');
      }

      const ammountOfFooterVisible =
        window.scrollY +
        window.innerHeight +
        footerHeight -
        layoutElement.clientHeight;
      if (ammountOfFooterVisible > 0) {
        registerSectionElement.style.setProperty(
          'bottom',
          `${ammountOfFooterVisible}px`
        );
      }
      if (ammountOfFooterVisible <= 0) {
        registerSectionElement.style.setProperty('bottom', '0');
      }
    }
  };
  const debouncedHandleScroll = debounce(handleScroll, 10, {
    leading: true,
    trailing: true,
  });

  useEffect(() => {
    window.addEventListener('scroll', () => debouncedHandleScroll());

    return () =>
      window.removeEventListener('scroll', () => debouncedHandleScroll());
  });

  return (
    <Layout id={layoutId}>
      <Header userId={data?.user.id} signOut={signOut} />

      <Content>
        <RegisterSection id={registerSectionId}>
          {data ? (
            <div>
              Use el menú superior para navegar entre los diferentes tipos de
              recomendación
            </div>
          ) : (
            <ProfileForm onFinish={register} />
          )}
        </RegisterSection>
        <ScrollableSection id={scrollableSectionId}>
          <div style={{ height: '1000px' }}>
            {feed.map((item) => (
              <div key={item.id}>{item.id}</div>
            ))}
            <div>{JSON.stringify(neighboursMatrix[1])}</div>
          </div>
        </ScrollableSection>
      </Content>

      <Footer />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<StaticProps> = async () => {
  const feed = await getItems(6);

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

  return {
    props: {
      feed,
      neighboursMatrix,
    },
  };
};

export default withTheme(HomePage);
