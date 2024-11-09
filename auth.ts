import Credentials from "next-auth/providers/credentials";
import User from "@/app/database/models/user";
import dbConnect from "@/app/database/utils/mongodb";
import bcrypt from 'bcryptjs';

import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Enter email..." },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("No user found with this email");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.username,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role as 'admin' | 'user';
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {

            console.log("this is my session ", session)
            if (session.user) {
                session.user.role = token.role as 'admin' | 'user';
                session.user.id = token.id as string;
            }
            return session;
        },

    },

});