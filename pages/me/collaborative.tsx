import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import {
  Genre,
  GenresOnItems,
  Item,
  Neighborhood,
  Preference,
  Rating,
  User,
} from '@prisma/client';
import styled from 'styled-components';
import { Col, PageHeader, Row } from 'antd';

import { getMyRatings } from '../api/my-ratings';
import { getPreferences } from '../api/preference';
import { getNeighborhood } from '../api/neighborhood';
import { Footer, Header } from '../../frontend/components/shared';

type RecommendedItem = Item & {
  rating: number;
};

type MyPreference = Preference & {
  genre: Genre;
};

type MyRating = Rating & {
  item: Item & {
    genres: (GenresOnItems & {
      genre: Genre;
    })[];
  };
};

type MyRatingWithGenreAsString = Rating & {
  item: Item & {
    genres: string[];
  };
};

type MyNeighborhood = Neighborhood & {
  rightUser: User & {
    ratings: MyRatingWithGenreAsString[];
  };
};

type ServerSideProps = {
  recommendedItems: RecommendedItem[];
  preferences: MyPreference[];
};

type Props = ServerSideProps;

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
`;

const CollaborativePage: NextPage<Props> = ({
  recommendedItems,
  preferences,
}) => {
  const { data } = useSession();

  return (
    <Layout>
      <Header userId={data?.user.id} signOut={signOut} />

      <Content>
        <PageHeader title="Recomendador colaborativo" />

        <Row>
          <Col span={12}>
            <pre>
              {JSON.stringify(
                {
                  ...data,
                  myPreferences: preferences,
                },
                null,
                2
              )}
            </pre>
          </Col>
          <Col span={12}>
            <pre>{JSON.stringify(recommendedItems, null, 2)}</pre>
          </Col>
        </Row>
      </Content>

      <Footer />
    </Layout>
  );
};

const convertGenresToString = (ratings: MyRating[]) => {
  return ratings.map((rating) => ({
    ...rating,
    item: {
      id: rating.item.id,
      title: rating.item.title,
      genres: rating.item.genres.map((genre) => genre.genre.name),
    },
  }));
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({
  req,
  res,
}) => {
  const session = await getSession({ req });
  let recommendedItems: RecommendedItem[] = [];
  let preferences: (Preference & {
    genre: Genre;
  })[] = [];

  if (session) {
    const ratings: MyRatingWithGenreAsString[] = convertGenresToString(
      await getMyRatings(session.user.id)
    );
    preferences = await getPreferences(session.user.id);
    const neighbours: MyNeighborhood[] = (
      await getNeighborhood(session.user.id)
    ).map((neighbour) => ({
      ...neighbour,
      rightUser: {
        ...neighbour.rightUser,
        ratings: convertGenresToString(neighbour.rightUser.ratings),
      },
    }));

    const neighboursRatings = neighbours
      .map((neighbour) =>
        neighbour.rightUser.ratings.map((rating) => ({
          ...rating,
          distance: neighbour.distance,
        }))
      )
      .reduce(
        (previousValue, currentValue) => [
          ...previousValue,
          ...currentValue.map((rating) => ({
            ...rating,
            rating: rating.rating * rating.distance,
          })),
        ],
        []
      )
      .filter(
        (neighbourRating) =>
          !ratings
            .map((rating) => rating.itemId)
            .includes(neighbourRating.itemId)
      );
    const itemsWithRating: (Item & {
      genres: string[];
      rating: number;
    })[] = [];
    for (let neighbourRating of neighboursRatings) {
      const itemWithRating = itemsWithRating.find(
        (item) => item.id === neighbourRating.itemId
      ) || { ...neighbourRating.item, rating: 0 };
      if (itemWithRating.rating === 0) {
        itemsWithRating.push(itemWithRating);
      }
      itemWithRating.rating += neighbourRating.rating;
    }
    recommendedItems = [...itemsWithRating]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  } else {
    res.statusCode = 403;
  }

  return {
    props: { recommendedItems, preferences },
  };
};

export default CollaborativePage;
