import styled from 'styled-components';
import { Col, Row } from 'antd';

import { RecommendedItem } from '../../../common/model/item.model';
import ItemCard from './itemCard';

type Props = {
  items: RecommendedItem[];
  posters: string[];
  className?: string;
};

const ItemsGrid: React.FC<Props> = ({ items, posters, className }) => {
  return (
    <div className={className}>
      <Row gutter={[24, 24]}>
        {items.map((item, i) => (
          <Col key={item.id} span={12}>
            <ItemCard item={item} poster={posters[i]} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default styled(ItemsGrid)`
  position: relative;
`;
