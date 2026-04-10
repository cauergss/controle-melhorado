/**
 * Rate limiter simples em memória para proteção contra brute force.
 * Funciona para aplicações single-process (Next.js dev/start padrão).
 */

type Attempt = { count: number; firstAt: number; blockedUntil?: number };

const store = new Map<string, Attempt>();

const WINDOW_MS = 15 * 60 * 1000; // janela de 15 minutos
const MAX_ATTEMPTS = 10;           // máximo de tentativas na janela
const BLOCK_MS = 30 * 60 * 1000;  // bloqueio de 30 minutos após exceder

/**
 * Registra uma tentativa para a chave fornecida.
 * Retorna { allowed: true } se a tentativa é permitida,
 * ou { allowed: false, retryAfterMs } se estiver bloqueado.
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  let entry = store.get(key);

  // Limpa entradas expiradas periodicamente (a cada 100 consultas)
  if (Math.random() < 0.01) cleanExpired();

  if (!entry) {
    store.set(key, { count: 1, firstAt: now });
    return { allowed: true };
  }

  // Ainda bloqueado?
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, retryAfterMs: entry.blockedUntil - now };
  }

  // Janela expirou — reinicia
  if (now - entry.firstAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now });
    return { allowed: true };
  }

  entry.count += 1;

  if (entry.count > MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS;
    store.set(key, entry);
    return { allowed: false, retryAfterMs: BLOCK_MS };
  }

  store.set(key, entry);
  return { allowed: true };
}

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    const expired = entry.blockedUntil
      ? now > entry.blockedUntil && now - entry.firstAt > WINDOW_MS
      : now - entry.firstAt > WINDOW_MS;
    if (expired) store.delete(key);
  }
}
