// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            role?: 'admin' | 'user';
            id?: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: 'admin' | 'user';
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: 'admin' | 'user';
        id?: string;
    }
}
