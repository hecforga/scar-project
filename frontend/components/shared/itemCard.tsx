import styled from 'styled-components';
import { Card, Image } from 'antd';

import { RecommendedItem } from '../../../common/model/item.model';

type Props = {
  item: RecommendedItem;
  poster: string;
  className?: string;
};

const ItemCard: React.FC<Props> = ({ item, poster, className }) => {
  return (
    <div className={className}>
      <Card
        hoverable
        bordered={false}
        style={{ width: 264, height: 520 }}
        cover={
          <Image
            alt={item.title}
            src={poster}
            style={{ width: 264, height: 400, objectFit: 'cover' }}
          />
        }
      >
        <Card.Meta
          title={item.title}
          description={`${item.rating.toFixed(2)} - ${item.genres.join(', ')}`}
        />
      </Card>
    </div>
  );
};

export default styled(ItemCard)`
  position: relative;
`;
