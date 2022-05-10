import { User } from '@prisma/client';
import styled from 'styled-components';
import { Button, Form, Input } from 'antd';

type Props = {
  user?: User;
  onFinish: () => void;
  className?: string;
};

const ProfileForm: React.FC<Props> = ({ onFinish, className }) => {
  return (
    <div className={className}>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default styled(ProfileForm)`
  position: relative;
`;
