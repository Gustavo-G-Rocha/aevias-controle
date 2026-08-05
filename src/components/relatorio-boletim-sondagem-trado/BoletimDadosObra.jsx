/**
 * Seção de dados da obra do boletim de sondagem.
 */
import React from 'react';
import { formatDate, getCliente, getOperador } from '@/utils/relatorioBoletimSondagemTradoUtils';

const SECTION_BAND =
  'bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider mb-1';

const Field = ({ label, value }) => (
  <div className="grid grid-cols-[64px_minmax(0,1fr)] items-baseline text-[10px] leading-tight text-left">
    <span className="font-bold whitespace-nowrap text-[#00233B]">{label}:</span>
    <span className="border-b border-[#94a3b8] text-[#00233B] min-w-0 text-left pb-0.5">{value}</span>
  </div>
);

export default function BoletimDadosObra({ boletim, obra, regional }) {
  const dadosObra = [
    ['OBRA', obra?.name || boletim.obra_name || '-'],
    ['CLIENTE', getCliente(boletim.cliente, regional?.cliente)],
    ['DATA', formatDate(boletim.data)],
    ['RODOVIA', boletim.rodovia || '-'],
    ['KM', boletim.km || '-'],
    ['PISTA', boletim.pista || '-'],
    ['BORDO', boletim.bordo || '-'],
    ['FURO', boletim.furo || '-'],
    ['OPERADOR', getOperador(boletim.operador, boletim.laboratorista_name)],
  ];

  return (
    <section className="mb-1">
      <div className={SECTION_BAND}>Dados da Obra</div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-2 px-2 py-1">
        {dadosObra.map(([label, val]) => (
          <Field key={label} label={label} value={val} />
        ))}
      </div>
    </section>
  );
}