import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import {
  Genre,
  GenresOnItems,
  Item,
  Preference,
  Rating,
  User,
} from '@prisma/client';
import * as dfd from 'danfojs-node';
import styled from 'styled-components';
import { Col, PageHeader, Row } from 'antd';

import { getRatings } from '../api/ratings';
import { getPreferences } from '../api/preference';
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
  user: {
    age: number;
    gender: string;
    occupation: string;
  };
};

type MyRatingWithGenreAsString = Rating & {
  item: Item & {
    genres: string[];
  };
  user: {
    age: number;
    gender: string;
    occupation: string;
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

const DemographicPage: NextPage<Props> = ({
  recommendedItems,
  preferences,
}) => {
  const { data } = useSession();

  return (
    <Layout>
      <Header userId={data?.user.id} signOut={signOut} />

      <Content>
        <PageHeader title="Recomendador demográfico" />

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

const computeQuantile = (
  df: dfd.DataFrame,
  columnName: string,
  q: number
): number => {
  const sortedValues = df.sortValues(columnName)[columnName].values;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return (
      sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base])
    );
  } else {
    return sortedValues[base];
  }
};

const convertRatingsToRecommenndedItems = (
  ratings: MyRatingWithGenreAsString[]
): RecommendedItem[] => {
  return ratings.map((rating) => ({
    ...rating.item,
    rating: rating.rating,
  }));
};

const getRecommendedItemsFormIds = (
  ratings: MyRatingWithGenreAsString[],
  recommendedItemsIds: number[]
): RecommendedItem[] => {
  let recommendedItems: RecommendedItem[] = [];
  for (let itemId of recommendedItemsIds) {
    const recommendedItem = ratings.find((rating) => rating.itemId === itemId);
    if (recommendedItem) {
      recommendedItems.push(
        convertRatingsToRecommenndedItems([recommendedItem])[0]
      );
    }
  }
  return recommendedItems;
};

const computeRecommendedItems = async (
  user: User,
  ratings: MyRatingWithGenreAsString[]
): Promise<RecommendedItem[]> => {
  let recommendedItemsIds: number[] = [];

  const minAge = Math.trunc(user.age / 10) * 10;
  const maxAge = minAge + 9;
  const filteredRatings = ratings.filter(
    (rating) =>
      rating.userId !== user.id &&
      rating.user.age >= minAge &&
      rating.user.age <= maxAge &&
      rating.user.gender === user.gender &&
      rating.user.occupation === user.occupation
  );
  let ratingsDf = new dfd.DataFrame(filteredRatings);

  if (filteredRatings.length === 0) {
    recommendedItemsIds = (await new dfd.DataFrame(ratings).sample(5))['itemId']
      .values as number[];
    return getRecommendedItemsFormIds(ratings, recommendedItemsIds);
  }

  ratingsDf = ratingsDf
    .groupby(['itemId'])
    .agg({ rating: ['mean', 'count'] }) as dfd.DataFrame;
  const c = ratingsDf['rating_mean'].mean();
  const m = computeQuantile(ratingsDf, 'rating_count', 0.9);

  const computeWeightedRating = (row: number[]): number => {
    const v = row[2];
    const r = row[1];
    return (v / (v + m)) * r + (m / (m + v)) * c;
  };
  ratingsDf.addColumn(
    'score',
    ratingsDf.apply(computeWeightedRating).values as number[],
    { inplace: true }
  );
  ratingsDf = ratingsDf
    .sortValues('score', { ascending: false })
    .head(5) as dfd.DataFrame;
  recommendedItemsIds = ratingsDf['itemId'].values as number[];
  for (let itemId of recommendedItemsIds) {
    const recommendedItem = ratings.find((rating) => rating.itemId === itemId);
    if (recommendedItem) {
      recommendedItem.rating = ratingsDf.loc({
        rows: ratingsDf['itemId'].eq(recommendedItem.itemId),
      })['score'].values[0];
    }
  }
  return getRecommendedItemsFormIds(ratings, recommendedItemsIds);
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({
  req,
  res,
}) => {
  const session = await getSession({ req });
  let recommendedItems: RecommendedItem[] = [];
  let preferences: MyPreference[] = [];

  if (session) {
    const ratings = convertGenresToString(await getRatings());
    recommendedItems = await computeRecommendedItems(session.user, ratings);

    preferences = await getPreferences(session.user.id);
  } else {
    res.statusCode = 403;
  }

  return {
    props: { recommendedItems, preferences },
  };
};

export default DemographicPage;
