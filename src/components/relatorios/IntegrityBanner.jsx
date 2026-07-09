import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { verifyIntegrity, hasIntegrityHash } from '@/utils/integrityHash';
import { logger } from '@/utils/logger';

/**
 * IntegrityBanner — Exibe o status de integridade de um registro assinado.
 *
 * Quando um registro foi aprovado/assinado, um hash SHA-256 foi calculado
 * e armazenado em `approver_details.integrity_hash`. Este componente
 * recalcula o hash do conteúdo atual e compara com o armazenado.
 *
 * - ✅ Verde: hash confere (registro íntegro)
 * - ⚠️ Vermelho: hash diverge (registro foi alterado após assinatura)
 *
 * NÃO BLOQUEIA acesso — apenas sinaliza visualmente.
 *
 * @param {object} props
 * @param {object} props.record - O registro assinado a verificar
 */
export default function IntegrityBanner({ record }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'valid' | 'invalid' | 'none'

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!record) {
        if (!cancelled) setStatus('none');
        return;
      }

      if (!hasIntegrityHash(record)) {
        if (!cancelled) setStatus('none');
        return;
      }

      try {
        const result = await verifyIntegrity(record);
        if (!cancelled) {
          setStatus(result.valid ? 'valid' : 'invalid');
        }
      } catch (err) {
        logger.error('[IntegrityBanner] Erro ao verificar integridade:', err);
        if (!cancelled) setStatus('none');
      }
    };

    check();
    return () => { cancelled = true; };
  }, [record]);

  if (status === 'none') return null;

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Verificando integridade...
      </div>
    );
  }

  if (status === 'valid') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
        <ShieldCheck className="w-3.5 h-3.5" />
        Integridade verificada
      </div>
    );
  }

  // status === 'invalid'
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
      <ShieldAlert className="w-3.5 h-3.5" />
      <span>Registro alterado após assinatura — integridade comprometida</span>
    </div>
  );
}