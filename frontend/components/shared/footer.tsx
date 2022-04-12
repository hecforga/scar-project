import styled from 'styled-components';

const FooterComp = styled.div`
  width: 100%;
  height: ${(props) => props.theme.footerHeight};

  background-color: white;
`;

const Footer: React.FC = () => {
  return (
    <FooterComp>
      <div>FOOTER</div>
    </FooterComp>
  );
};

export default Footer;
