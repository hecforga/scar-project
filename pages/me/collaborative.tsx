import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import styled from 'styled-components';
import { Col, PageHeader, Row } from 'antd';

import { getMyRatings } from '../api/my-ratings';
import { getPreferences } from '../api/preference';
import { getNeighborhood } from '../api/neighborhood';
import { RecommendedItem } from '../../common/model/item.model';
import { MyPreference } from '../../common/model/preference.model';
import { MyRatingWithGenreAsString } from '../../common/model/rating.model';
import { MyNeighborhood } from '../../common/model/neighborhood.model';
import {
  computeRecommendedItems,
  convertGenresToString,
} from '../../common/utils/collaborative.utils';
import usePosterService from '../../frontend/services/posterService';
import { Footer, Header, ItemsGrid } from '../../frontend/components/shared';

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
  padding-left: ${(props) => props.theme.grid.getGridColumns(1, 1)};
  padding-right: ${(props) => props.theme.grid.getGridColumns(1, 1)};
`;

const CollaborativePage: NextPage<Props> = ({
  recommendedItems,
  preferences,
}) => {
  const { data } = useSession();
  const posterService = usePosterService();

  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosters = async (): Promise<void> => {
      const auxPosters: string[] = [];
      for (let recommendedItem of recommendedItems) {
        auxPosters.push(await posterService.getPoster(recommendedItem.title));
      }
      setPosters(auxPosters);
    };

    fetchPosters();
  }, [recommendedItems, posterService]);

  if (posters.length !== recommendedItems.length) {
    return null;
  }

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

    recommendedItems = computeRecommendedItems(ratings, neighbours);
  } else {
    res.statusCode = 403;
  }

  return {
    props: { recommendedItems, preferences },
  };
};

export default CollaborativePage;