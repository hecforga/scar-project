import { useSession, signOut } from 'next-auth/react';
import { Button } from 'antd';

export default function MePage() {
  const { data } = useSession();

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button type="primary" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </div>
  );
}
