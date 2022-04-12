import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;

      smd: string;
      mdd: string;
      lgd: string;
      xld: string;

      smu: string;
      mdu: string;
      lgu: string;
      xlu: string;
    };

    grid: {
      getGridColumns: (cols: int, extraGutters?: int) => string;
      xsGutter: string;
      smGutter: string;
      mdGutter: string;
      lgGutter: string;
      xlGutter: string;
      xxlGutter: string;
    };

    headerHeight: string;
    footerHeight: string;
  }
}
