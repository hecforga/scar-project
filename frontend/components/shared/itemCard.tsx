import styled from 'styled-components';
import { Card, Image, Tooltip } from 'antd';

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
        style={{ width: 280, height: 520 }}
        cover={
          <Image
            alt={item.title}
            src={poster}
            style={{ width: 280, height: 400, objectFit: 'cover' }}
          />
        }
      >
        <Tooltip title={item.title}>
          <Card.Meta
            title={item.title}
            description={`${item.rating.toFixed(2)} - ${item.genres.join(
              ', '
            )}`}
          />
        </Tooltip>
      </Card>
    </div>
  );
};

export default styled(ItemCard)`
  position: relative;
`;
