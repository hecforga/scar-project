import { DefaultTheme } from 'styled-components';

export const xsMax = 575;
export const smMax = 767;
export const mdMax = 991;
export const lgMax = 1199;
export const xlMax = 1599;

const gridColumns = 24;

const theme: DefaultTheme = {
  breakpoints: {
    xs: `(max-width: ${xsMax}px)`,
    sm: `(min-width: ${xsMax + 1}px) and (max-width: ${smMax}px)`,
    md: `(min-width: ${smMax + 1}px) and (max-width: ${mdMax}px)`,
    lg: `(min-width: ${mdMax + 1}px) and (max-width: ${lgMax}px)`,
    xl: `(min-width: ${lgMax + 1}px) and (max-width: ${xlMax}px)`,
    xxl: `(min-width: ${xlMax + 1}px)`,

    smd: `(max-width: ${smMax}px)`,
    mdd: `(max-width: ${mdMax}px)`,
    lgd: `(max-width: ${lgMax}px)`,
    xld: `(max-width: ${xlMax}px)`,

    smu: `(min-width: ${xsMax + 1}px)`,
    mdu: `(min-width: ${smMax + 1}px)`,
    lgu: `(min-width: ${mdMax + 1}px)`,
    xlu: `(min-width: ${lgMax + 1}px)`,
  },

  grid: {
    getGridColumns: (cols: number, extraGutters = 0): string => {
      const nGutters = cols - 1 + extraGutters;
      return `calc((((100vw - (${
        gridColumns - 1
      } * var(--gutter))) / ${gridColumns}) * ${cols}) + (${nGutters} * var(--gutter)))`;
    },
    xsGutter: '4px',
    smGutter: '6px',
    mdGutter: '6px',
    lgGutter: '6px',
    xlGutter: '6px',
    xxlGutter: '6px',
  },

  headerHeight: '80px',
  footerHeight: '80px',
};

export default theme;
