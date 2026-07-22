import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  generateSecret,
  verifyTotp,
  sha256Hex,
  generateRecoveryCodes,
  getTwoFactorConfig,
  verifyTwoFactorForUser,
} from '../../shared/totp.ts';

/**
 * Backend function: gerenciarDoisFatores
 *
 * Gerencia a autenticação em duas etapas (TOTP — RFC 6238):
 *   - status:      { enabled, pending, recoveryCodesRemaining, lockedUntil }
 *   - setup:       gera segredo pendente → { secret, otpauthUrl }
 *   - activate:    confirma primeiro código → ativa e retorna códigos de recuperação (uma única vez)
 *   - verify:      valida TOTP ou código de recuperação (com lockout)
 *   - disable:     desativa (exige código válido)
 *   - admin_reset: admin remove o 2FA de outro usuário (recuperação de acesso/lockout)
 *
 * O segredo TOTP nunca é lido pelo cliente após o setup — toda verificação
 * ocorre server-side (entidade TwoFactorConfig com RLS restrito a admin).
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, code, targetEmail } = body;
    const email = (user.email || '').toLowerCase();
    const config = await getTwoFactorConfig(base44, email);

    if (action === 'status') {
      return Response.json({
        enabled: config?.status === 'active',
        pending: config?.status === 'pending',
        recoveryCodesRemaining: config?.status === 'active' ? (config.recovery_codes || []).length : 0,
        lockedUntil: config?.locked_until || null,
      });
    }

    if (action === 'setup') {
      if (config?.status === 'active') {
        return Response.json({ error: '2FA já está ativo. Desative antes de reconfigurar.' }, { status: 400 });
      }
      const secret = generateSecret();
      if (config) {
        await base44.asServiceRole.entities.TwoFactorConfig.update(config.id, {
          secret, status: 'pending', failed_attempts: 0, locked_until: null, recovery_codes: [],
        });
      } else {
        await base44.asServiceRole.entities.TwoFactorConfig.create({
          user_email: email, secret, status: 'pending', failed_attempts: 0, recovery_codes: [],
        });
      }
      const issuer = 'AfirmaEvias QA';
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      return Response.json({ secret, otpauthUrl });
    }

    if (action === 'activate') {
      if (!config || config.status !== 'pending') {
        return Response.json({ error: 'Nenhuma configuração pendente. Inicie a ativação novamente.' }, { status: 400 });
      }
      const valid = await verifyTotp(config.secret, code);
      if (!valid) {
        return Response.json({ error: 'Código incorreto. Confira o app autenticador e tente novamente.' }, { status: 400 });
      }
      const recoveryCodes = generateRecoveryCodes();
      const hashes = [];
      for (const c of recoveryCodes) {
        hashes.push(await sha256Hex(c.toUpperCase()));
      }
      await base44.asServiceRole.entities.TwoFactorConfig.update(config.id, {
        status: 'active',
        recovery_codes: hashes,
        activated_at: new Date().toISOString(),
        failed_attempts: 0,
        locked_until: null,
      });
      // Códigos de recuperação retornados em texto claro UMA única vez.
      return Response.json({ success: true, recoveryCodes });
    }

    if (action === 'verify') {
      if (!config || config.status !== 'active') {
        // Sem 2FA ativo — nada a verificar (gate de login usa este caminho)
        return Response.json({ success: true, enabled: false });
      }
      const result = await verifyTwoFactorForUser(base44, config, code);
      if (!result.ok) {
        return Response.json({ error: result.reason }, { status: 403 });
      }
      return Response.json({ success: true, method: result.method });
    }

    if (action === 'disable') {
      if (!config) return Response.json({ success: true });
      if (config.status !== 'active') {
        // Configuração pendente abandonada — remove sem exigir código
        await base44.asServiceRole.entities.TwoFactorConfig.delete(config.id);
        return Response.json({ success: true });
      }
      const result = await verifyTwoFactorForUser(base44, config, code);
      if (!result.ok) {
        return Response.json({ error: result.reason }, { status: 403 });
      }
      await base44.asServiceRole.entities.TwoFactorConfig.delete(config.id);
      return Response.json({ success: true });
    }

    if (action === 'admin_reset') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Apenas administradores podem redefinir o 2FA de outro usuário.' }, { status: 403 });
      }
      const target = await getTwoFactorConfig(base44, targetEmail);
      if (target) {
        await base44.asServiceRole.entities.TwoFactorConfig.delete(target.id);
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});