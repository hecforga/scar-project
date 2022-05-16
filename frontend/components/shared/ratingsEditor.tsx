import { Rating } from '@prisma/client';
import styled from 'styled-components';
import { Descriptions } from 'antd';

import { MyRatingWithGenreAsString } from '../../../common/model/rating.model';

type Props = {
  ratings: MyRatingWithGenreAsString[];
  onRatingAdd?: (rating: Rating) => void;
  className?: string;
};

const RatingsEditor: React.FC<Props> = ({ ratings, className }) => {
  return (
    <div className={className}>
      <Descriptions title="Información colaborativa" />

      {ratings.length === 0 ? (
        <div>
          De momento, solo se soporta la inserción/edición de valoraciones
          directamente por base de datos.
        </div>
      ) : (
        <div>Has realizado un total de {ratings.length} valoraciones</div>
      )}
    </div>
  );
};

export default styled(RatingsEditor)`
  position: relative;
`;
