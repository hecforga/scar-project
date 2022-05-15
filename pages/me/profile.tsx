import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import { User } from '@prisma/client';
import styled from 'styled-components';
import { Button, Col, PageHeader, Row } from 'antd';

import { convertGenresToString, getMyRatings } from '../api/my-ratings';
import { MyRatingWithGenreAsString } from '../../common/model/rating.model';
import useUserService from '../../frontend/services/userService';
import {
  Footer,
  Header,
  ProfileForm,
  RatingsEditor,
} from '../../frontend/components/shared';

type ServerSideProps = {
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

const ProfilePage: NextPage<Props> = ({ ratings }) => {
  const { data } = useSession();
  const userService = useUserService();

  const [user, setUser] = useState<User | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (user) {
      try {
        setSaving(true);
        await userService.update(user);
      } catch (e) {
        console.log(e);
      }

      setSaving(false);
    }
  };

  useEffect(() => {
    if (!user && data) {
      setUser(data.user);
    }
  }, [data, user]);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Header userId={data?.user.id} signOut={signOut} />

      <Content>
        <PageHeader title={`Perfil de usuario ${user.id}`} />

        <Row gutter={[32, 24]} justify="center">
          <Col span={12}>
            <ProfileForm user={user} onUserChange={setUser} />
          </Col>

          <Col span={12}>
            <RatingsEditor ratings={ratings} onRatingAdd={() => null} />
          </Col>

          <Col span={8}>
            <Button
              type="primary"
              disabled={!user.age || !user.gender || !user.occupation || saving}
              style={{ width: '100%' }}
              onClick={save}
            >
              Guardar
            </Button>
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
  let ratings: MyRatingWithGenreAsString[] = [];

  if (session) {
    ratings = convertGenresToString(await getMyRatings(session.user.id));
  } else {
    res.statusCode = 403;
  }

  return {
    props: { ratings },
  };
};

export default ProfilePage;
