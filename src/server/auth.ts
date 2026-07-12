import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { getDb, schema } from "@/server/db";
import { seedUserDefaults } from "@/server/services/user-setup";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // Sem provedor de e-mail transacional por enquanto (ver docs/decisions.md):
    // o link de recuperação é registrado no log do servidor.
    sendResetPassword: async ({ user, url }) => {
      console.log(`[LifeHub] Link de recuperação de senha para ${user.email}: ${url}`);
    },
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : undefined,
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await seedUserDefaults(createdUser.id);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
