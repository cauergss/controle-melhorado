import { createHmac, randomBytes, timingSafeEqual, createHash } from "crypto";

// Chave secreta lida de variável de ambiente (obrigatória em produção)
const SECRET_KEY = process.env.AUTH_SECRET ?? "dev-secret-change-in-production-32chars!";

export type SessionPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  iat: number; // issued at (timestamp)
};

/**
 * Hash de senha usando PBKDF2 (derivação de chave com salt)
 * Formato: pbkdf2$iterations$salt$hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const iterations = 100_000;
  const { pbkdf2Sync } = require("crypto");
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

/**
 * Verifica se uma senha bate com um hash armazenado.
 * Suporta senhas ainda em texto plano (legado) para migração gradual.
 */
export function verifyPassword(password: string, stored: string): boolean {
  // Senha ainda em texto plano (legado) — aceita mas avisa
  if (!stored.startsWith("pbkdf2$")) {
    return password === stored;
  }

  const parts = stored.split("$");
  if (parts.length !== 4) return false;

  const [, iterStr, salt, expectedHash] = parts;
  const iterations = parseInt(iterStr, 10);
  if (!iterations || iterations < 1) return false;

  const { pbkdf2Sync } = require("crypto");
  const actualHash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");

  // Comparação em tempo constante para evitar timing attacks
  try {
    return timingSafeEqual(Buffer.from(actualHash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Verifica se uma senha está em texto plano (precisa migrar)
 */
export function isLegacyPassword(stored: string): boolean {
  return !stored.startsWith("pbkdf2$");
}

/**
 * Cria um token de sessão assinado: base64(payload).HMAC
 */
export function signSession(payload: Omit<SessionPayload, "iat">): string {
  const data: SessionPayload = { ...payload, iat: Date.now() };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = createHmac("sha256", SECRET_KEY).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

/**
 * Verifica e decodifica um token de sessão.
 * Retorna null se inválido ou adulterado.
 */
export function verifySession(token: string): SessionPayload | null {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const expectedSig = createHmac("sha256", SECRET_KEY).update(encoded).digest("base64url");

  // Comparação em tempo constante
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    // Sessão expira em 8 horas
    const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
    if (Date.now() - payload.iat > SESSION_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
