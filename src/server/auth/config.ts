import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Stripe from "stripe";

import { db } from "~/server/db";
import { env } from "~/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "production", // Keep debug in production for now
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
      },
    }),
  },
  events: {
    createUser: async ({ user }) => {
      // Create Stripe customer when a new user signs up
      if (!user.email) return;

      try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);

        const stripeCustomer = await stripe.customers.create({
          email: user.email.toLowerCase(),
          name: user.name ?? undefined,
        });

        // Update user with Stripe customer ID
        await db.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: stripeCustomer.id },
        });
      } catch (error) {
        console.error("Failed to create Stripe customer:", error);
      }
    },
  },
} satisfies NextAuthConfig;
