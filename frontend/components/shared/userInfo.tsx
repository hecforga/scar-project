import styled from 'styled-components';
import { User } from '@prisma/client';
import { Descriptions } from 'antd';

import { MyPreference } from '../../../common/model/preference.model';

type Props = {
  user: User;
  preferences: MyPreference[];
  className?: string;
};

const UserInfo: React.FC<Props> = ({ user, preferences, className }) => {
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
          {preferences.map((p) => p.genre.name).join(', ')}
        </Descriptions.Item>
        {/* <Descriptions.Item label="Config Info">
          Data disk type: MongoDB
          <br />
          Database version: 3.4
          <br />
          Package: dds.mongo.mid
          <br />
          Storage space: 10 GB
          <br />
          Replication factor: 3
          <br />
          Region: East China 1<br />
        </Descriptions.Item> */}
      </Descriptions>
    </div>
  );
};

export default styled(UserInfo)`
  position: relative;
`;
