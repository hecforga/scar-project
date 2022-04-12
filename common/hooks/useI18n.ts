import { useContext } from 'react';

import { I18nContext, I18nContextType } from '../../libs/i18n';

const useI18n = (): I18nContextType => {
  return useContext(I18nContext);
};

export default useI18n;
