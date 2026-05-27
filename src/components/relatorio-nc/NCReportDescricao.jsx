/**
 * Seção de descrição do relatório de NC.
 */
import React from 'react';

export default function NCReportDescricao({ nc }) {
  return (
    <>
      <section>
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider bg-slate-100 px-3 py-1 mb-3">
          Descrição da Não Conformidade
        </h2>
        <div className="border border-slate-300 rounded p-4 bg-gray-50 min-h-[120px] whitespace-pre-wrap">
          {nc.descricao_nc || '—'}
        </div>
      </section>

      {nc.acoes && (
        <section>
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider bg-slate-100 px-3 py-1 mb-3">
            Ações a Serem Tomadas
          </h2>
          <div className="border border-slate-300 rounded p-4 bg-gray-50 min-h-[80px] whitespace-pre-wrap">
            {nc.acoes}
          </div>
        </section>
      )}
    </>
  );
}