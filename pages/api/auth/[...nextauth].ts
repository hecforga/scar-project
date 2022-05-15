import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '@prisma/client';

import prisma from '../../../libs/prisma';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'User id',
      credentials: {
        username: { label: 'User id', type: 'text' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Whatever',
        },
      },
      async authorize(credentials, _req) {
        if (!credentials) {
          return null;
        }

        let user;
        try {
          user = await prisma.user.findFirst({
            where: {
              id: +credentials.username,
            },
          });
        } catch (e) {
          console.log(e);
          return null;
        }

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  theme: {
    colorScheme: 'light',
  },
  callbacks: {
    async session({ session, token }) {
      session.user =
        (token.user as User) &&
        ((await prisma.user.findFirst({
          where: {
            id: (token.user as User).id,
          },
        })) as User);
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
});
