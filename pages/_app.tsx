import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import theme from '../common/themes/default';
import I18n from '../libs/i18n';

const GlobalStyle = createGlobalStyle`
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  html {
    box-sizing: border-box;
    font-size: 14px;
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }

  body {
    margin: 0;
  }

  :root {
    @media ${(props) => props.theme.breakpoints.xs} {
      --gutter: ${(props) => props.theme.grid.xsGutter};
    }
    @media ${(props) => props.theme.breakpoints.sm} {
      --gutter: ${(props) => props.theme.grid.smGutter};
    }
    @media ${(props) => props.theme.breakpoints.md} {
      --gutter: ${(props) => props.theme.grid.mdGutter};
    }
    @media ${(props) => props.theme.breakpoints.lg} {
      --gutter: ${(props) => props.theme.grid.lgGutter};
    }
    @media ${(props) => props.theme.breakpoints.xl} {
      --gutter: ${(props) => props.theme.grid.xlGutter};
    }
    @media ${(props) => props.theme.breakpoints.xxl} {
      --gutter: ${(props) => props.theme.grid.xxlGutter};
    }
  }

  header a, footer a {
    color: black;

    &:hover,:active {
      color: black;
    }
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  const handleResize = () => {
    const vhResizable = document.documentElement.clientHeight * 0.01;
    document.documentElement.style.setProperty(
      '--vh-resizable',
      `${vhResizable}px`
    );
  };

  useEffect(() => {
    const vh = document.documentElement.clientHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', handleResize);
  });
  return (
    <>
      <ThemeProvider theme={theme}>
        <I18n>
          <SessionProvider session={pageProps.session} refetchInterval={0}>
            <GlobalStyle />
            <Component {...pageProps} />
          </SessionProvider>
        </I18n>
      </ThemeProvider>
    </>
  );
}
