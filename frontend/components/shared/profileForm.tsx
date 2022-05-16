import { User } from '@prisma/client';
import styled from 'styled-components';
import { Descriptions, Form, InputNumber, Select } from 'antd';

import { MyUserCreateInput } from '../../../common/model/user.model';

type Props = {
  user: User | MyUserCreateInput;
  onUserChange: (user: User | MyUserCreateInput) => void;
  className?: string;
};

const occupations = [
  'educator',
  'artist',
  'administrator',
  'student',
  'doctor',
  'executive',
  'homemaker',
  'lawyer',
  'programmer',
  'retired',
  'salesman',
  'scientist',
  'engineer',
  'healthcare',
  'writer',
  'marketing',
  'librarian',
  'technician',
  'entertainment',
  'none',
  'other',
];

const ProfileForm: React.FC<Props> = ({ user, onUserChange, className }) => {
  const onAgeChange = (age: number) => {
    onUserChange({
      ...user,
      age,
    });
  };

  const onGenderChange = (gender: string) => {
    onUserChange({
      ...user,
      gender,
    });
  };

  const onOccupationChange = (occupation: string) => {
    onUserChange({
      ...user,
      occupation,
    });
  };

  return (
    <div className={className}>
      <Descriptions title="Información demográfica" />

      <Form
        name="profile"
        layout="vertical"
        autoComplete="off"
        fields={[
          { name: 'age', value: user.age },
          { name: 'gender', value: user.gender },
          { name: 'occupation', value: user.occupation },
        ]}
      >
        <Form.Item
          label="Edad"
          name="age"
          rules={[{ required: true, message: 'Campo obligatorio' }]}
        >
          <InputNumber style={{ width: '100%' }} onChange={onAgeChange} />
        </Form.Item>

        <Form.Item
          label="Género"
          name="gender"
          rules={[{ required: true, message: 'Campo obligatorio' }]}
        >
          <Select placeholder="Elige tu género" onChange={onGenderChange}>
            <Select.Option value="M">M</Select.Option>
            <Select.Option value="F">F</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Profesión"
          name="occupation"
          rules={[{ required: true, message: 'Campo obligatorio' }]}
        >
          <Select
            placeholder="Elige tu profesión"
            onChange={onOccupationChange}
          >
            {occupations.map((o) => (
              <Select.Option key={o} value={o}>
                {o}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};

export default styled(ProfileForm)`
  position: relative;
`;
