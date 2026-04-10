// Tipos exportados (sem dependências de crypto para uso em edge runtime)
export type SessionPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  iat: number; // issued at (timestamp)
};

/**
 * Decodifica um token de sessão SEM VERIFICAÇÃO DE ASSINATURA.
 * Útil para middleware (edge runtime) que apenas precisa ler a payload.
 * IMPORTANTE: Use apenas para ler dados. Para validações de segurança,
 * use verifySession de auth.server.ts no servidor.
 */
export function decodeSession(token: string): SessionPayload | null {
  try {
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return null;

    const encoded = token.slice(0, dotIndex);
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;

    // Verifica expiração (8 horas)
    const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
    if (Date.now() - payload.iat > SESSION_TTL_MS) return null;

    return payload;
  } catch {
    return null;
  }
}
