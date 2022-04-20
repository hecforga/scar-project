import { Session } from 'next-auth';
import { User } from '@prisma/client';

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth' {
  interface Session {
    user: User;
  }
}
