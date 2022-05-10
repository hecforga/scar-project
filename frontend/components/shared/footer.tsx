import styled from 'styled-components';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

type Props = {
  className?: string;
};

const Footer: React.FC<Props> = ({ className }) => {
  const menu = (
    <Menu>
      <Menu.Item key="0">
        <a>Español</a>
      </Menu.Item>
    </Menu>
  );

  const scarProjectText = `SCAR Project ${new Date().getFullYear()}`;

  return (
    <footer className={className}>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button type="text" onClick={(e) => e.preventDefault()}>
          Español <DownOutlined />
        </Button>
      </Dropdown>
      <a href="mailto:hctrfg@gmail.com">
        {scarProjectText}
        <span> | Héctor Fornes Gabaldón</span>
      </a>
    </footer>
  );
};

export default styled(Footer)`
  width: 100%;
  height: ${(props) => props.theme.footerHeight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: ${(props) => props.theme.grid.getGridColumns(1, 1)};
  padding-right: ${(props) => props.theme.grid.getGridColumns(1, 1)};
  background-color: white;
`;
