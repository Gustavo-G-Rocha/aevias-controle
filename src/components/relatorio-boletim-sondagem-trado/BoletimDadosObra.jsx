/**
 * Seção de dados da obra do boletim de sondagem.
 */
import React from 'react';
import { formatDate, getCliente, getOperador } from '@/utils/relatorioBoletimSondagemTradoUtils';

export default function BoletimDadosObra({ boletim, obra, regional }) {
  const dadosObra = [
    ['OBRA', obra?.name || '-'],
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
      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px] mb-1">
        DADOS DA OBRA
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[10px]">
        {dadosObra.map(([label, val]) => (
          <div key={label}>
            <span className="font-bold text-gray-700">{label}: </span>
            <span className="text-gray-900">{val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}