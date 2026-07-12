const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  USER_ALREADY_EXISTS: "Já existe uma conta com este e-mail.",
  USER_NOT_FOUND: "Nenhuma conta encontrada com este e-mail.",
  INVALID_TOKEN: "Link inválido ou expirado. Solicite a recuperação novamente.",
  PASSWORD_TOO_SHORT: "A senha deve ter pelo menos 8 caracteres.",
  PASSWORD_TOO_LONG: "Senha muito longa.",
  EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de entrar.",
};

export function translateAuthError(code?: string): string {
  if (code && code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return "Algo deu errado. Tente novamente.";
}
