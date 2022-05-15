import { Rating } from '@prisma/client';
import styled from 'styled-components';
import { Descriptions } from 'antd';

import { MyRatingWithGenreAsString } from '../../../common/model/rating.model';

type Props = {
  ratings: MyRatingWithGenreAsString[];
  onRatingAdd: (rating: Rating) => void;
  className?: string;
};

const RatingsEditor: React.FC<Props> = ({ ratings, className }) => {
  return (
    <div className={className}>
      <Descriptions title="Información colaborativa" />

      <div>{ratings.length}</div>
    </div>
  );
};

export default styled(RatingsEditor)`
  position: relative;
`;
