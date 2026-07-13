import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Loader2, Hash, Clock, User, BadgeCheck, Fingerprint } from 'lucide-react';
import { verificarAssinatura } from '@/functions/verificarAssinatura';
import { logger } from '@/utils/logger';

/**
 * VerificarAssinatura — Página pública de verificação de assinatura eletrônica.
 *
 * Acessada via QR code no PDF impresso. Não requer login.
 * Compara o hash do documento atual com o hash armazenado no momento
 * da assinatura. Exibe:
 *  - Íntegro (hash bate): selo verde + metadados da assinatura
 *  - Divergente (hash não bate): aviso vermelho de divergência
 *  - Não assinado: aviso neutro
 *  - Erro: mensagem de erro
 */
function formatBrasiliaDate(dateString) {
  if (!dateString) return '—';
  try {
    let normalized = dateString;
    if (!normalized.endsWith('Z') && !normalized.includes('+') && !normalized.includes('-', 10)) {
      normalized = normalized + 'Z';
    }
    return new Date(normalized).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'long',
      timeStyle: 'medium',
    });
  } catch {
    return dateString;
  }
}

function truncateHash(hash) {
  if (!hash) return '—';
  if (hash.length <= 24) return hash;
  return `${hash.substring(0, 12)}...${hash.substring(hash.length - 10)}`;
}

const roleLabel = {
  'admin': 'Administrador',
  'sala_tecnica_afirmaevias': 'Sala Técnica',
  'gestor_contrato': 'Gestor de Contrato',
  'cliente': 'Cliente',
  'cliente_supervisor': 'Cliente Supervisor',
};

export default function VerificarAssinatura() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const entityName = urlParams.get('entityName');
    const recordId = urlParams.get('recordId');

    if (!entityName || !recordId) {
      setError('Parâmetros de verificação ausentes. Escaneie o QR code do documento para validar.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await verificarAssinatura({ entityName, recordId });
        setResult(response.data || response);
      } catch (err) {
        logger.error('[VerificarAssinatura] Erro:', err);
        const errData = err?.response?.data || err?.data || {};
        setResult(errData);
        setError(errData?.error || err?.message || 'Erro ao verificar assinatura');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-600">Verificando assinatura eletrônica...</p>
        </div>
      </div>
    );
  }

  // ── ERRO DE PARÂMETROS ──
  if (error && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-6 text-center">
          <ShieldX className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-slate-700 mb-1">Verificação Indisponível</h1>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  // ── NÃO ASSINADO ──
  if (result && !result.signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-6 text-center">
          <ShieldX className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-slate-700 mb-1">Documento Não Assinado</h1>
          <p className="text-sm text-slate-500">
            {result.message || 'Este documento não possui assinatura eletrônica registrada.'}
          </p>
        </div>
      </div>
    );
  }

  // ── DIVERGENTE ──
  if (result && result.signed && !result.intact) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md w-full rounded-xl border border-red-300 bg-white p-6 space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 border border-red-300 mb-3">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-lg font-bold text-red-900">Documento Alterado Após Assinatura</h1>
            <p className="text-sm text-red-700 mt-1">
              O hash do documento atual <strong>não confere</strong> com o hash
              registrado no momento da assinatura. O conteúdo foi modificado após
              o ato de assinatura eletrônica.
            </p>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-mono">
            <div>
              <span className="text-red-500">Hash assinado: </span>
              <span className="text-red-700 break-all">{truncateHash(result.storedHash)}</span>
            </div>
            <div>
              <span className="text-red-500">Hash atual: </span>
              <span className="text-red-700 break-all">{truncateHash(result.computedHash)}</span>
            </div>
          </div>

          {result.signature && (
            <div className="text-xs text-slate-500 border-t border-red-100 pt-3">
              <p>Assinatura original realizada por <strong>{result.signature.signed_by_name}</strong> em {formatBrasiliaDate(result.signature.signed_at)}.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ÍNTEGRO ──
  if (result && result.signed && result.intact) {
    const sig = result.signature || {};
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="max-w-md w-full rounded-xl border border-green-300 bg-white p-6 space-y-4">
          {/* Selo de integridade */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 border border-green-300 mb-3">
              <ShieldCheck className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-lg font-bold text-green-900">Documento Íntegro</h1>
            <p className="text-sm text-green-700 mt-1">
              O hash do documento confere com o registrado no momento da assinatura.
              O conteúdo não foi alterado após o ato de assinatura eletrônica.
            </p>
          </div>

          {/* Metadados da assinatura */}
          {sig && (
            <div className="space-y-2.5 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium">{sig.signed_by_name || '—'}</span>
                {sig.signed_by_role && (
                  <span className="text-slate-500 text-xs">
                    • {roleLabel[sig.signed_by_role] || sig.signed_by_role}
                  </span>
                )}
              </div>

              {sig.signed_by_crea && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <BadgeCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>CREA: {sig.signed_by_crea}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Assinado em {formatBrasiliaDate(sig.signed_at)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Fingerprint className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-mono" title={sig.signature_hash}>
                  {truncateHash(sig.signature_hash)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>
                  {sig.signature_method === 'eletronica_simples_reforcada'
                    ? 'Assinatura Eletrônica Simples Reforçada'
                    : sig.signature_method}
                </span>
              </div>
            </div>
          )}

          {/* Rodapé legal */}
          <p className="text-[10px] text-slate-400 leading-relaxed text-center border-t border-green-100 pt-3">
            Assinatura eletrônica com força probatória conforme Lei 14.063/2020.
            Integridade verificada por comparação de hash SHA-256.
          </p>
        </div>
      </div>
    );
  }

  // ── FALLBACK ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-6 text-center">
        <ShieldX className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm text-slate-600">{error || 'Não foi possível verificar a assinatura.'}</p>
      </div>
    </div>
  );
}