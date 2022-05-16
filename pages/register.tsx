import { Fragment, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession, signOut, getSession } from 'next-auth/react';
import styled from 'styled-components';
import { Alert, Button, Col, PageHeader, Row } from 'antd';

import { convertGenresToString, getMyRatings } from './api/my-ratings';
import { MyRatingWithGenreAsString } from '../common/model/rating.model';
import { MyUserCreateInput } from '../common/model/user.model';
import useUserService from '../frontend/services/userService';
import {
  Footer,
  Header,
  ProfileForm,
  RatingsEditor,
} from '../frontend/components/shared';
import { User } from '@prisma/client';

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

const RegisterPage: NextPage<Props> = ({ ratings }) => {
  const router = useRouter();
  const { status } = useSession();
  const userService = useUserService();

  const [user, setUser] = useState<MyUserCreateInput>({
    age: undefined,
    gender: undefined,
    occupation: undefined,
  });
  const [saving, setSaving] = useState(false);
  const [createdUser, setCreatedUser] = useState<User | undefined>();

  const homeUrl =
    typeof window === 'undefined'
      ? undefined
      : window?.location.href.substring(
          0,
          window?.location.href.lastIndexOf('/register') + 1
        );

  const save = async () => {
    if (user) {
      try {
        setSaving(true);
        setCreatedUser(await userService.create(user));
      } catch (e) {
        console.log(e);
      }

      setSaving(false);
    }
  };

  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    router.push('/');
  }

  return (
    <Layout>
      <Header userId={undefined} signOut={signOut} />

      <Content>
        <PageHeader title="Registro de nuevo usuario" />

        {createdUser && (
          <Fragment>
            <Row justify="center">
              <Col span={16}>
                <Alert
                  message={`El usuario con id ${createdUser.id} ha sido registrado con éxito. Puedes usar dicho id para iniciar sesión.`}
                  type="success"
                  action={
                    <a
                      href={`${homeUrl}api/auth/signin?callbackUrl=${homeUrl}`}
                    >
                      <Button size="small" type="ghost">
                        Iniciar sesión
                      </Button>
                    </a>
                  }
                />
              </Col>
            </Row>
            <br />
          </Fragment>
        )}

        <Row gutter={[32, 24]} justify="center">
          <Col span={12}>
            <ProfileForm user={user} onUserChange={setUser} />
          </Col>

          <Col span={12}>
            <RatingsEditor ratings={ratings} />
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

export default RegisterPage;
