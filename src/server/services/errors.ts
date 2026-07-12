/** Recurso inexistente ou pertencente a outro usuário — vira 404 na API. */
export class NotFoundError extends Error {
  constructor(message = "Recurso não encontrado") {
    super(message);
    this.name = "NotFoundError";
  }
}
