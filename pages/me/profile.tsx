import { NextPage } from 'next';
import { useSession, signOut } from 'next-auth/react';
import styled from 'styled-components';
import { Col, Row } from 'antd';

import { Footer, Header } from '../../frontend/components/shared';

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

const ProfilePage: NextPage = () => {
  const { data } = useSession();

  return (
    <Layout>
      <Header userId={data?.user.id} signOut={signOut} />

      <Content>
        <Row>
          <Col span={12}>
            <pre>
              {JSON.stringify(
                {
                  ...data?.user,
                },
                null,
                2
              )}
            </pre>
          </Col>
        </Row>
      </Content>

      <Footer />
    </Layout>
  );
};

export default ProfilePage;
