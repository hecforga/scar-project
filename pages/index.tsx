import { useEffect } from 'react';
import { NextPage } from 'next';
import styled, { DefaultTheme, withTheme } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import debounce from 'lodash.debounce';
import { Button } from 'antd';
import { EnvironmentFilled } from '@ant-design/icons';

import useI18n from '../common/hooks/useI18n';
import { Footer, Header } from '../frontend/components/shared';

type Props = {
  theme: DefaultTheme;
};

const layoutId = 'comprarViviendasLayoutId';
const mapSectionId = 'comprarViviendasMapSection';
const showMapButtonSectionId = 'comprarViviendasShowMapButtonSection';
const transparentMddSectionId = 'comprarViviendasTransparentMddSection';
const scrollableSectionId = 'comprarViviendasScrollableSection';
const transparentMddSectionBottomPadding = '112px';

let lastScrollY = -1;

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
  min-height: ${(props) =>
    `calc(100vh - ${props.theme.headerHeight} - ${props.theme.footerHeight})`};
  min-height: ${(props) =>
    `calc(var(--vh, 1vh) * 100 - ${props.theme.headerHeight} - ${props.theme.footerHeight})`};

  @media ${(props) => props.theme.breakpoints.mdd} {
    margin-top: 0;
    min-height: ${(props) => `calc(100vh - ${props.theme.footerHeight})`};
    min-height: ${(props) =>
      `calc(var(--vh, 1vh) * 100 - ${props.theme.footerHeight})`};
  }
`;

const MapSection = styled.div`
  background-color: grey;
  position: fixed;
  top: ${(props) => props.theme.headerHeight};
  bottom: 0;
  left: ${(props) => props.theme.grid.getGridColumns(14, -1)};
  right: 0;
  z-index: 10;

  @media ${(props) => props.theme.breakpoints.mdd} {
    top: 0;
    bottom: unset;
    height: calc(100vh - 80px);
    height: calc(var(--vh, 1vh) * 100 - 80px);
    left: 0;
  }
`;

const ShowMapButtonSection = styled.div`
  position: fixed;
  left: ${(props) => props.theme.grid.getGridColumns(2, 1)};
  right: ${(props) => props.theme.grid.getGridColumns(2, 1)};
  bottom: 32px;
  z-index: 100;
  display: none;
`;

const ShowMapButton = styled(Button)`
  float: right;
`;

const TransparentMddSection = styled.div`
  height: calc(100vh - ${transparentMddSectionBottomPadding});
  height: calc(var(--vh, 1vh) * 100 - ${transparentMddSectionBottomPadding});
  pointer-events: none;
  @media ${(props) => props.theme.breakpoints.lgu} {
    display: none;
  }
`;

const ScrollableSection = styled.div`
  position: relative;
  width: ${(props) => props.theme.grid.getGridColumns(14, -1)};
  background-color: white;
  z-index: 20;

  @media ${(props) => props.theme.breakpoints.mdd} {
    width: 100%;
    padding-top: 40px;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
  }
`;

const HomePage: NextPage<Props> = ({ theme }) => {
  const i18n = useI18n();

  const isMdd = useMediaQuery({ query: theme.breakpoints.mdd });

  const showMap = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = (initial?: boolean) => {
    if (typeof window === 'undefined') {
      return;
    }

    const headerHeight = +theme.headerHeight.replace('px', '');
    const footerHeight = +theme.footerHeight.replace('px', '');

    const layoutElement = document.getElementById(layoutId);
    const transparentMddSectionElement = document.getElementById(
      transparentMddSectionId
    );

    const mapSectionElement = document.getElementById(mapSectionId);
    if (!isMdd && layoutElement && mapSectionElement) {
      const ammountOfHeaderVisible = headerHeight - window.scrollY;
      if (ammountOfHeaderVisible > 0) {
        mapSectionElement.style.setProperty(
          'top',
          `${ammountOfHeaderVisible}px`
        );
      }
      if (ammountOfHeaderVisible <= 0) {
        mapSectionElement.style.setProperty('top', '0');
      }

      const ammountOfFooterVisible =
        window.scrollY +
        window.innerHeight +
        footerHeight -
        layoutElement.clientHeight;
      if (ammountOfFooterVisible > 0) {
        mapSectionElement.style.setProperty(
          'bottom',
          `${ammountOfFooterVisible}px`
        );
      }
      if (ammountOfFooterVisible <= 0) {
        mapSectionElement.style.setProperty('bottom', '0');
      }
    }

    const showMapButtonSectionElement = document.getElementById(
      showMapButtonSectionId
    );
    if (transparentMddSectionElement && showMapButtonSectionElement) {
      if (lastScrollY === -1) {
        showMapButtonSectionElement.style.setProperty('display', 'none');
      }
      lastScrollY = window.scrollY;
      setTimeout(() => {
        if (window.scrollY === lastScrollY) {
          showMapButtonSectionElement.style.setProperty(
            'display',
            `${
              isMdd &&
              window.scrollY > transparentMddSectionElement.clientHeight
                ? 'block'
                : 'none'
            }`
          );
          lastScrollY = -1;
        }
      }, 300);
    }

    if (initial && isMdd) {
      setTimeout(() =>
        window.scrollTo(
          0,
          (window.innerHeight -
            +transparentMddSectionBottomPadding.replace('px', '')) *
            0.5
        )
      );
    }
  };
  const debouncedHandleScroll = debounce(handleScroll, 10, {
    leading: true,
    trailing: true,
  });

  useEffect(() => {
    window.addEventListener('scroll', () => debouncedHandleScroll());

    return () =>
      window.removeEventListener('scroll', () => debouncedHandleScroll());
  });

  return (
    <Layout id={layoutId}>
      <Header />

      <Content>
        <MapSection id={mapSectionId} />
        <ShowMapButtonSection id={showMapButtonSectionId}>
          <ShowMapButton
            type="primary"
            icon={<EnvironmentFilled />}
            onClick={showMap}
          >
            {i18n.t('search.actions.showMap')}
          </ShowMapButton>
        </ShowMapButtonSection>
        <TransparentMddSection id={transparentMddSectionId} />
        <ScrollableSection id={scrollableSectionId}>
          <div style={{ height: '2000px', backgroundColor: 'blue' }}>TODO</div>
        </ScrollableSection>
      </Content>

      <Footer />
    </Layout>
  );
};

export default withTheme(HomePage);
