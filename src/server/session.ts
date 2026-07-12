import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";

/** Sessão atual (ou null). Uso em Server Components, Actions e route handlers. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Exige usuário autenticado; redireciona para /login caso contrário. */
export async function requireUser() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session.user;
}
