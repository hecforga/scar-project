import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { Row, Col, Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import logo from '../../../public/images/logo.png';

type Props = {
  userId?: number;
  signOut: () => Promise<void>;
  className?: string;
};

const Header: React.FC<Props> = ({ userId, signOut, className }) => {
  const signOutMenuItem = (
    <Menu.Item>
      <a
        href="#"
        onClick={() => {
          signOut();
        }}
      >
        Cerrar sesión
      </a>
    </Menu.Item>
  );

  const userMenu = (
    <Menu>
      <Menu.Item>
        <Link href="/me/profile">
          <a>Perfil</a>
        </Link>
      </Menu.Item>
      {signOutMenuItem}
    </Menu>
  );

  const userDropdown = (
    <Dropdown overlay={userMenu}>
      <div>
        {userId && (
          <Button type="text">
            Usuario {userId} <DownOutlined />
          </Button>
        )}
      </div>
    </Dropdown>
  );

  return (
    <header className={className}>
      <div>
        <Link href="/">
          <a>
            <Row gutter={8} align="middle">
              <Col>
                <Image alt="logo" src={logo} width={113} height={40} />
              </Col>
              <Col style={{ marginTop: '8px' }}>
                <span>SCAR Project</span>
              </Col>
            </Row>
          </a>
        </Link>
      </div>
      <Row gutter={16} align="middle">
        <Col>
          <Button type="text">
            <Link href="/me/demographic">
              <a>Demográfico</a>
            </Link>
          </Button>
        </Col>
        <Col>
          <Button type="text">
            <Link href="/me/collaborative">
              <a>Colaborativo</a>
            </Link>
          </Button>
        </Col>
        <Col>
          <Button type="text">
            <Link href="/me/hybrid">
              <a>Híbrido</a>
            </Link>
          </Button>
        </Col>
        <Col>{userDropdown}</Col>
      </Row>
    </header>
  );
};

export default styled(Header)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: ${(props) => props.theme.headerHeight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: ${(props) => props.theme.grid.getGridColumns(1, 1)};
  padding-right: ${(props) => props.theme.grid.getGridColumns(1, 1)};
  background-color: white;
`;
