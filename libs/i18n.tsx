import {
  FunctionComponent,
  createContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import rosetta from 'rosetta';

import { ROSSETA_LOCALE_KEY } from '../common/consts';
import ES from '../common/locales/es.json';
import EN from '../common/locales/en.json';

const i18n = rosetta();

export const defaultLanguage = 'es';
const defaultDict = ES;
const dicts: {
  [key: string]: {
    langCode: string;
    title: string;
  };
} = { es: ES, en: EN };

export type I18nContextType = {
  activeLocale: string;
  t: (
    key: string | (string | number)[],
    params?: any[] | Record<string, any>,
    lang?: string
  ) => string;
  locale: (l: string) => void;
};

export const I18nContext = createContext<I18nContextType>(undefined!);

const getActiveLocaleFromLocalStorage = (): string => {
  return typeof window === 'undefined'
    ? defaultLanguage
    : localStorage.getItem(ROSSETA_LOCALE_KEY) || defaultLanguage;
};

const I18n: FunctionComponent = ({ children }) => {
  const activeLocale = getActiveLocaleFromLocalStorage();
  const activeDict = dicts[activeLocale] || defaultDict;
  const [, setTick] = useState(0);
  const firstRender = useRef(true);

  const setLocale = (lang: string, table: unknown): void => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang);
    }
    i18n.locale(lang);
    i18n.set(lang, table);
    // force rerender
    setTick((tick) => tick + 1);
  };

  // for initial SSR render
  if (firstRender.current === true) {
    firstRender.current = false;
    setLocale(activeLocale, activeDict);
  }

  useEffect(() => {
    const activeLocaleFromLocalStorage = getActiveLocaleFromLocalStorage();
    if (activeLocale !== activeLocaleFromLocalStorage) {
      const dict = dicts[activeLocaleFromLocalStorage];
      if (dict) {
        setLocale(activeLocaleFromLocalStorage, dict);
      }
    }
  }, [activeLocale]);

  const i18nWrapper = {
    activeLocale,
    t: (
      key: string | (string | number)[],
      params?: any[] | Record<string, any>,
      lang?: string
    ) => i18n.t(key, params, lang),
    locale: (l: string) => {
      const dict = dicts[l];
      if (dict) {
        localStorage.setItem(ROSSETA_LOCALE_KEY, l);
        setLocale(l, dict);
      }
    },
  };

  return (
    <I18nContext.Provider value={i18nWrapper}>{children}</I18nContext.Provider>
  );
};

export default I18n;
