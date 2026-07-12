import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let cached: Database | null = null;

/**
 * Client Drizzle sobre Neon (HTTP). Criado sob demanda para que módulos que
 * não tocam o banco possam ser importados sem DATABASE_URL definida.
 */
export function getDb(): Database {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL não definida. Copie .env.example para .env.local e preencha.");
    }
    cached = drizzle({ client: neon(url), schema });
  }
  return cached;
}

export { schema };
