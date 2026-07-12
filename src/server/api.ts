import { NextResponse } from "next/server";
import { z } from "zod";

import { NotFoundError } from "@/server/services/errors";
import { getSession } from "@/server/session";

/**
 * Envelopa um handler da API v1: autentica pela sessão do Better Auth e
 * converte erros em respostas JSON consistentes (401/400/404/500).
 */
export async function withApiAuth<T>(
  fn: (userId: string) => Promise<T>,
  { status = 200 }: { status?: number } = {},
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const data = await fn(session.user.id);
    return NextResponse.json(data ?? { ok: true }, { status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: error.issues }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }
    console.error("[api/v1]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
