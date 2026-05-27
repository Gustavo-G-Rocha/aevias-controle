/**
 * Seção de dados gerais do relatório de NC.
 */
import React from 'react';

export default function NCReportDadosGerais({ nc }) {
  return (
    <section>
      <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider bg-slate-100 px-3 py-1 mb-3">
        Dados Gerais
      </h2>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Cliente</p>
          <p className="text-gray-800">{nc.cliente || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Contrato</p>
          <p className="text-gray-800">{nc.contrato || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Executora</p>
          <p className="text-gray-800">{nc.executora || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Rodovia</p>
          <p className="text-gray-800">{nc.rodovia || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Trecho</p>
          <p className="text-gray-800">{nc.trecho || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">
            Campo (Afirma Evias)
          </p>
          <p className="text-gray-800">{nc.campo || '—'}</p>
        </div>
      </div>
    </section>
  );
}