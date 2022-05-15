import { Fragment } from 'react';
import styled from 'styled-components';
import { User } from '@prisma/client';
import { Descriptions } from 'antd';

import { MyPreference } from '../../../common/model/preference.model';
import { MyNeighborhood } from '../../../common/model/neighborhood.model';

type Props = {
  user: User;
  preferences: MyPreference[];
  neighbours: MyNeighborhood[];
  className?: string;
};

const UserInfo: React.FC<Props> = ({
  user,
  preferences,
  neighbours,
  className,
}) => {
  return (
    <div className={className}>
      <Descriptions title="Información del usuario" bordered column={2}>
        <Descriptions.Item label="Id">{user.id}</Descriptions.Item>
        <Descriptions.Item label="Edad">{user.age}</Descriptions.Item>
        <Descriptions.Item label="Género">{user.gender}</Descriptions.Item>
        <Descriptions.Item label="Ocupación">
          {user.occupation}
        </Descriptions.Item>
        <Descriptions.Item label="Preferencias">
          {preferences.map((p, i) => (
            <Fragment key={i}>
              <span>
                {p.genre.name}: {p.value}
              </span>
              {i < preferences.length - 1 && <br />}
            </Fragment>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="Vecinos">
          {neighbours.map((n, i) => (
            <Fragment key={i}>
              <span>
                {n.rightUserId}: {n.distance.toFixed(2)}
              </span>
              {i < neighbours.length - 1 && <br />}
            </Fragment>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default styled(UserInfo)`
  position: relative;
`;
