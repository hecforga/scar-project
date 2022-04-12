import styled from 'styled-components';

const HeaderComp = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;

  width: 100%;
  height: ${(props) => props.theme.headerHeight};

  background-color: white;
`;

const Header: React.FC = () => {
  return (
    <HeaderComp>
      <div>HEADER</div>
    </HeaderComp>
  );
};

export default Header;
