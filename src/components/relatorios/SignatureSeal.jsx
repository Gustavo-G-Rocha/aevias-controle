import React from 'react';
import { ShieldCheck, Hash, Clock, User, BadgeCheck } from 'lucide-react';

/**
 * SignatureSeal — Selo visual de assinatura eletrônica.
 *
 * Exibido em telas de detalhe e relatórios para mostrar visivelmente
 * (não apenas em metadados internos) que o documento foi assinado
 * eletronicamente, com nome do signatário, papel, data/hora do servidor
 * e hash do documento.
 *
 * Props:
 *   signature: object — registro de AssinaturaEletronica ou objeto com
 *     { signed_by_name, signed_by_role, signed_by_crea, signed_at,
 *       signature_hash, signature_method }
 *   compact?: boolean — versão compacta para barras de ação
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
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return dateString;
  }
}

function truncateHash(hash) {
  if (!hash) return '—';
  if (hash.length <= 20) return hash;
  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
}

export default function SignatureSeal({ signature, compact = false }) {
  if (!signature) return null;

  const name = signature.signed_by_name || signature.name || '—';
  const role = signature.signed_by_role || signature.position || '';
  const crea = signature.signed_by_crea || signature.crea_number || '';
  const signedAt = signature.signed_at || signature.signed_date || '';
  const hash = signature.signature_hash || signature.integrity_hash || '';
  const method = signature.signature_method || 'eletronica_simples_reforcada';

  const roleLabel = {
    'admin': 'Administrador',
    'sala_tecnica_afirmaevias': 'Sala Técnica',
    'gestor_contrato': 'Gestor de Contrato',
    'cliente': 'Cliente',
    'cliente_supervisor': 'Cliente Supervisor',
  }[role] || role;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-medium text-blue-800">Assinado eletronicamente</span>
          <span className="text-blue-600">{name} • {formatBrasiliaDate(signedAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-4 space-y-3">
      {/* Cabeçalho do selo */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-blue-900">Assinatura Eletrônica</span>
          <span className="text-xs text-blue-600">
            {method === 'eletronica_simples_reforcada'
              ? 'Assinatura Eletrônica Simples Reforçada'
              : method}
          </span>
        </div>
      </div>

      {/* Dados do signatário */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-medium">{name}</span>
          {roleLabel && <span className="text-slate-500">• {roleLabel}</span>}
        </div>

        {crea && (
          <div className="flex items-center gap-2 text-slate-600">
            <BadgeCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>CREA: {crea}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Assinado em {formatBrasiliaDate(signedAt)} (horário do servidor)</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-mono" title={hash}>{truncateHash(hash)}</span>
        </div>
      </div>

      {/* Rodapé legal */}
      <p className="text-[10px] text-slate-400 leading-relaxed border-t border-blue-100 pt-2">
        Assinatura eletrônica simples com força probatória reforçada conforme
        Lei 14.063/2020. Integridade verificável via QR code ou hash SHA-256.
      </p>
    </div>
  );
}