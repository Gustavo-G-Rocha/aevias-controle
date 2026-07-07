// Funções puras de cálculo para o Dashboard — sem dependência de React
// ETAPA 4/5: single-pass, Map para lookups, sem .filter() duplicado

import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getEntityLabel, getEntityColor, PIE_COLORS } from './entityConfig';

// ─── calcularStats ────────────────────────────────────────────────────────────
// Single-pass: conta approved/pending/rejected/assinados em uma única iteração.
export function calcularStats(ensaios, obras, projects, isClienteUser, isEngenheiroUser) {
  // Acumular tudo em uma passagem
  let approved = 0, pending = 0, rejected = 0, assinados = 0, aguardando = 0;
  for (const e of ensaios) {
    if (e.client_signature?.signed_by) assinados++;
    if (e.approved === true) {
      approved++;
      if (isEngenheiroUser && isClienteUser && !e.client_signature?.signed_by) aguardando++;
    } else if (e.approved === null) {
      pending++;
    } else if (e.approved === false) {
      rejected++;
    }
  }

  if (isClienteUser) {
    return {
      obras: obras.length,
      projects: projects.length,
      ensaios: ensaios.length,
      approved,
      pending: 0,
      rejected: 0,
      assinados,
      aguardando_assinatura: aguardando,
    };
  }

  return {
    obras: obras.length,
    projects: projects.length,
    ensaios: ensaios.length,
    approved,
    pending,
    rejected,
    assinados,
    aguardando_assinatura: 0,
  };
}

// ─── calcularGraficoMensal ────────────────────────────────────────────────────
// Agrupa ensaios por mês em uma única passagem com Map (era N passes via .filter()).
export function calcularGraficoMensal(ensaios, periodo, isClienteUser) {
  const now = new Date();
  const monthsToShow = periodo === '1mes' ? 1 : periodo === '3meses' ? 3 : 6;

  const months = Array.from({ length: monthsToShow }, (_, i) =>
    subMonths(now, monthsToShow - 1 - i)
  );

  // Construir intervalos uma única vez
  const intervals = months.map(m => ({
    month: m,
    start: startOfMonth(m),
    end: endOfMonth(m),
    name: format(m, 'MMM', { locale: ptBR }),
    ensaios: 0,
    aprovados: 0,
    assinados: 0,
  }));

  // Single-pass: classificar cada ensaio no mês correto
  for (const e of ensaios) {
    const d = new Date(e.created_date);
    for (const slot of intervals) {
      if (isWithinInterval(d, { start: slot.start, end: slot.end })) {
        slot.ensaios++;
        if (isClienteUser) {
          if (e.client_signature?.signed_by) { slot.aprovados++; slot.assinados++; }
        } else {
          if (e.approved === true) slot.aprovados++;
        }
        break; // cada ensaio pertence a um único mês
      }
    }
  }

  return intervals.map(({ name, ensaios, aprovados, assinados }) => ({
    name, ensaios, aprovados, assinados,
  }));
}

// ─── calcularGraficoStatus ────────────────────────────────────────────────────
// Single-pass: conta em uma única iteração (era 3 .filter() separados).
export function calcularGraficoStatus(ensaios, isClienteUser, isEngenheiroUser) {
  let approved = 0, pending = 0, rejected = 0, assinados = 0, aguardando = 0;
  for (const e of ensaios) {
    if (e.client_signature?.signed_by) assinados++;
    if (e.approved === true) {
      approved++;
      if (isEngenheiroUser && isClienteUser && !e.client_signature?.signed_by) aguardando++;
    } else if (e.approved === null) {
      pending++;
    } else if (e.approved === false) {
      rejected++;
    }
  }

  if (isClienteUser) {
    return [
      { name: 'Assinados', value: assinados, color: '#566E3D' },
      { name: 'Aguardando', value: aguardando, color: '#FBBF24' },
    ].filter(item => item.value > 0);
  }

  return [
    { name: 'Aprovados', value: approved, color: '#566E3D' },
    { name: 'Pendentes', value: pending, color: '#FBBF24' },
    { name: 'Reprovados', value: rejected, color: '#800020' },
  ].filter(item => item.value > 0);
}

// ─── calcularGraficoPorObra ───────────────────────────────────────────────────
// Map para lookup O(1) em vez de obras.find() dentro de Object.entries loop.
export function calcularGraficoPorObra(ensaios, obras) {
  const obrasMap = new Map(obras.map(o => [o.id, o]));
  const count = new Map();

  for (const e of ensaios) {
    if (e.obra_id) count.set(e.obra_id, (count.get(e.obra_id) || 0) + 1);
  }

  return Array.from(count.entries())
    .map(([obraId, value], index) => ({
      name: obrasMap.get(obraId)?.name ?? 'Desconhecida',
      value,
      obraId,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

// ─── calcularGraficoPorTipo ───────────────────────────────────────────────────
// Single-pass com Map (era for...forEach duplicado).
export function calcularGraficoPorTipo(ensaios) {
  const count = new Map();
  for (const e of ensaios) {
    if (e.entityType) count.set(e.entityType, (count.get(e.entityType) || 0) + 1);
  }

  return Array.from(count.entries())
    .map(([type, value]) => ({
      name: getEntityLabel(type),
      value,
      color: getEntityColor(type),
      entityType: type,
    }))
    .sort((a, b) => b.value - a.value);
}

// ─── calcularApprovalPercentage ───────────────────────────────────────────────
export function calcularApprovalPercentage(stats, isClienteUser) {
  if (isClienteUser) {
    const total = stats.assinados + stats.aguardando_assinatura;
    return total > 0 ? ((stats.assinados / total) * 100).toFixed(0) : '100';
  }
  return stats.ensaios > 0 ? ((stats.approved / stats.ensaios) * 100).toFixed(0) : '0';
}