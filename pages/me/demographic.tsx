import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import styled from 'styled-components';
import { Col, PageHeader, Row } from 'antd';

import { getRatings } from '../api/ratings';
import { convertGenresToString, getMyRatings } from '../api/my-ratings';
import { getPreferences } from '../api/preference';
import { getNeighborhood } from '../api/neighborhood';
import { getItems } from '../api/items';
import { getUsers } from '../api/users';
import { RecommendedItem } from '../../common/model/item.model';
import {
  getRatingsAsRecommendedItems,
  MyRatingWithGenreAsString,
} from '../../common/model/rating.model';
import { MyPreference } from '../../common/model/preference.model';
import { MyNeighborhood } from '../../common/model/neighborhood.model';
import { computeRecommendedItems } from '../../common/utils/demographic.utils';
import usePosterService from '../../frontend/services/posterService';
import {
  Footer,
  Header,
  ItemsGrid,
  UserInfo,
} from '../../frontend/components/shared';

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

const DemographicPage: NextPage<Props> = ({
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
        <PageHeader title="Recomendador demográfico" />

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
              posters={posters.slice(5)}
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
    recommendedItems = await computeRecommendedItems(
      session.user,
      ratings,
      users,
      items
    );

    preferences = await getPreferences(session.user.id);
    neighbours = (await getNeighborhood(session.user.id)).map((neighbour) => ({
      ...neighbour,
      rightUser: {
        ...neighbour.rightUser,
        ratings: convertGenresToString(neighbour.rightUser.ratings),
      },
    }));

    myRatings = convertGenresToString(await getMyRatings(session.user.id))
      .filter((r) => r.rating === 5)
      .slice(0, 4);
  } else {
    res.statusCode = 403;
  }

  return {
    props: { recommendedItems, preferences, neighbours, ratings: myRatings },
  };
};

export default DemographicPage;
