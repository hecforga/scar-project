import axios from 'axios';
import { createContext, useContext } from 'react';

const apiKey = '591cd379';

const placeholder = '/images/placeholder.jpg';

class PosterService {
  private axiosInstance = axios.create({
    baseURL: 'https://www.omdbapi.com',
  });

  async getPoster(titleWithYear: string): Promise<string> {
    let title = titleWithYear.replace(/\(.*?\)/, '').trim();
    if (title.includes(', The')) {
      title = 'The ' + title.substring(-5);
    } else if (title.includes(', A')) {
      title = 'A  ' + title.substring(-3);
    } else if (title.includes(', Il')) {
      title = 'Il ' + title.substring(-4);
    }

    const year = titleWithYear.substring(
      titleWithYear.length - 5,
      titleWithYear.length - 1
    );

    if (process.env.NODE_ENV === 'development') {
      return placeholder;
    }

    try {
      const res = await this.axiosInstance.get('', {
        params: {
          apiKey,
          t: title,
          type: 'movie',
          year,
        },
      });
      if (!res.data.Poster || !res.data.Poster.includes('http')) {
        throw new Error();
      }
      return res.data.Poster;
    } catch (e) {
      return placeholder;
    }
  }
}

const posterService = new PosterService();
const PosterServiceContext = createContext<PosterService>(posterService);
const usePosterService = (): PosterService => {
  return useContext(PosterServiceContext);
};

export default usePosterService;
