import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import styled from 'styled-components';
import { Col, PageHeader, Row } from 'antd';

import { convertGenresToString, getMyRatings } from '../api/my-ratings';
import { getPreferences } from '../api/preference';
import { getNeighborhood } from '../api/neighborhood';
import { RecommendedItem } from '../../common/model/item.model';
import { MyPreference } from '../../common/model/preference.model';
import {
  getRatingsAsRecommendedItems,
  MyRatingWithGenreAsString,
} from '../../common/model/rating.model';
import { MyNeighborhood } from '../../common/model/neighborhood.model';
import * as collaborativeUtils from '../../common/utils/collaborative.utils';
import * as demographicUtils from '../../common/utils/demographic.utils';
import usePosterService from '../../frontend/services/posterService';
import {
  Footer,
  Header,
  ItemsGrid,
  UserInfo,
} from '../../frontend/components/shared';
import { getRatings } from '../api/ratings';
import { getUsers } from '../api/users';
import { getItems } from '../api/items';

type ServerSideProps = {
  recommendedItems: RecommendedItem[];
  preferences: MyPreference[];
  neighbours: MyNeighborhood[];
  ratings: MyRatingWithGenreAsString[];
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
  padding-left: ${(props) => props.theme.grid.getGridColumns(1, 1)};
  padding-right: ${(props) => props.theme.grid.getGridColumns(1, 1)};
`;

const HybridPage: NextPage<Props> = ({
  recommendedItems,
  preferences,
  neighbours,
  ratings,
}) => {
  const { data } = useSession();
  const posterService = usePosterService();

  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosters = async (): Promise<void> => {
      const auxPosters: string[] = [];
      for (let recommendedItem of [
        ...recommendedItems,
        ...getRatingsAsRecommendedItems(ratings),
      ]) {
        auxPosters.push(await posterService.getPoster(recommendedItem.title));
      }
      setPosters(auxPosters);
    };

    fetchPosters();
  }, [recommendedItems, ratings, posterService]);

  if (!data || posters.length !== recommendedItems.length + ratings.length) {
    return null;
  }

  return (
    <Layout>
      <Header userId={data?.user.id} signOut={signOut} />

      <Content>
        <PageHeader title="Recomendador colaborativo" />

        <Row gutter={32}>
          <Col span={12}>
            <UserInfo
              user={data.user}
              preferences={preferences}
              neighbours={neighbours}
            />
            <br />
            <ItemsGrid
              items={getRatingsAsRecommendedItems(ratings)}
              posters={posters.slice(4)}
              isRating={true}
            />
          </Col>

          <Col span={12}>
            <ItemsGrid items={recommendedItems} posters={posters} />
          </Col>
        </Row>
      </Content>

      <Footer />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({
  req,
  res,
}) => {
  const session = await getSession({ req });
  let recommendedItems: RecommendedItem[] = [];
  let preferences: MyPreference[] = [];
  let neighbours: MyNeighborhood[] = [];
  let myRatings: MyRatingWithGenreAsString[] = [];

  if (session) {
    const ratings = await getRatings();
    const users = await getUsers();
    const items = await getItems();

    myRatings = convertGenresToString(await getMyRatings(session.user.id));
    preferences = await getPreferences(session.user.id);
    neighbours = (await getNeighborhood(session.user.id)).map((neighbour) => ({
      ...neighbour,
      rightUser: {
        ...neighbour.rightUser,
        ratings: convertGenresToString(neighbour.rightUser.ratings),
      },
    }));

    const collaborativeRecommendedItems =
      collaborativeUtils.computeRecommendedItems(myRatings, neighbours);
    const demographicRecommendedItems =
      await demographicUtils.computeRecommendedItems(
        session.user,
        ratings,
        users,
        items
      );
    let collaborativeCount = 0;
    let demographicCount = 0;
    while (recommendedItems.length < 6) {
      if (collaborativeCount <= demographicCount) {
        const collaborativeItem =
          collaborativeRecommendedItems[collaborativeCount];
        if (!recommendedItems.find((i) => i.id === collaborativeItem.id)) {
          recommendedItems.push(collaborativeItem);
        }
        collaborativeCount += 1;
      } else {
        const demographicItem = demographicRecommendedItems[demographicCount];
        if (!recommendedItems.find((i) => i.id === demographicItem.id)) {
          recommendedItems.push(demographicItem);
        }
        demographicCount += 1;
      }
    }
    console.log(collaborativeCount);
    console.log(demographicCount);
    recommendedItems = [...recommendedItems].sort(
      (a, b) => b.rating - a.rating
    );

    myRatings = myRatings.filter((r) => r.rating === 5).slice(0, 4);
  } else {
    res.statusCode = 403;
  }

  return {
    props: { recommendedItems, preferences, neighbours, ratings: myRatings },
  };
};

export default HybridPage;
