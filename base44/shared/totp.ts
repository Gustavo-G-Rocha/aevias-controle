/**
 * Módulo compartilhado de TOTP (RFC 6238) e verificação 2FA.
 * Usado por: gerenciarDoisFatores, assinarEletronicamente.
 * Sem dependências externas — WebCrypto (HMAC-SHA1) nativo.
 */

const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let bits = 0, value = 0, out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str) {
  const clean = String(str).toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0, value = 0;
  const out = [];
  for (const c of clean) {
    const idx = B32_ALPHABET.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function hotp(keyBytes, counter) {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 4294967296));
  view.setUint32(4, counter >>> 0);
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const offset = sig[sig.length - 1] & 0xf;
  const code = ((sig[offset] & 0x7f) << 24) | (sig[offset + 1] << 16) | (sig[offset + 2] << 8) | sig[offset + 3];
  return String(code % 1000000).padStart(6, '0');
}

/** Verifica um código TOTP com janela de tolerância ±1 (clock skew). */
export async function verifyTotp(secretBase32, code, window = 1) {
  const clean = String(code || '').replace(/\D/g, '');
  if (clean.length !== 6) return false;
  const key = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let w = -window; w <= window; w++) {
    if (await hotp(key, counter + w) === clean) return true;
  }
  return false;
}

export async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(str)));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Gera códigos de recuperação de uso único no formato XXXXX-XXXXX. */
export function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(5));
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    codes.push(`${hex.slice(0, 5)}-${hex.slice(5)}`);
  }
  return codes;
}

/** Busca a configuração 2FA do usuário (via service role — RLS restrito). */
export async function getTwoFactorConfig(base44, email) {
  const rows = await base44.asServiceRole.entities.TwoFactorConfig.filter(
    { user_email: (email || '').toLowerCase() }, '-created_date', 1
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Verifica um código (TOTP ou recuperação) contra a config ativa,
 * com lockout por tentativas. Códigos de recuperação são consumidos.
 */
export async function verifyTwoFactorForUser(base44, config, code) {
  const now = Date.now();
  if (config.locked_until && new Date(config.locked_until).getTime() > now) {
    return { ok: false, reason: 'Muitas tentativas incorretas. Verificação bloqueada temporariamente — tente novamente em alguns minutos ou contate um administrador.' };
  }

  if (await verifyTotp(config.secret, code)) {
    await base44.asServiceRole.entities.TwoFactorConfig.update(config.id, {
      failed_attempts: 0, locked_until: null, last_verified_at: new Date().toISOString(),
    });
    return { ok: true, method: 'totp' };
  }

  // Código de recuperação (uso único)
  const hash = await sha256Hex(String(code || '').trim().toUpperCase());
  const codes = config.recovery_codes || [];
  if (codes.includes(hash)) {
    await base44.asServiceRole.entities.TwoFactorConfig.update(config.id, {
      recovery_codes: codes.filter((c) => c !== hash),
      failed_attempts: 0, locked_until: null, last_verified_at: new Date().toISOString(),
    });
    return { ok: true, method: 'recovery' };
  }

  const attempts = (config.failed_attempts || 0) + 1;
  const patch = { failed_attempts: attempts };
  if (attempts >= MAX_ATTEMPTS) {
    patch.failed_attempts = 0;
    patch.locked_until = new Date(now + LOCKOUT_MINUTES * 60 * 1000).toISOString();
  }
  await base44.asServiceRole.entities.TwoFactorConfig.update(config.id, patch);
  return {
    ok: false,
    reason: attempts >= MAX_ATTEMPTS
      ? `Muitas tentativas incorretas. Verificação bloqueada por ${LOCKOUT_MINUTES} minutos.`
      : 'Código incorreto. Tente novamente.',
  };
}