import path from 'path';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { readCSV, toJSON } from 'danfojs-node';

type IUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: number;
  age: number;
  gender: string;
  occupation: string;
};

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
          const dataDir = path.resolve('./public', 'data');
          const df = await readCSV(dataDir + '/users.txt');
          const users = toJSON(df) as Array<IUser>;
          user = users.find((u) => u.id === +credentials.username);
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
      session.user = token.user as IUser;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      token.userRole = 'admin';
      return token;
    },
  },
});
