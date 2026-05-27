/**
 * Seção de classificação do relatório de NC.
 */
import React from 'react';
import { hasClassificacao } from '@/utils/relatorioNCUtils';

export default function NCReportClassificacao({ nc }) {
  if (!hasClassificacao(nc)) return null;

  return (
    <section>
      <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider bg-slate-100 px-3 py-1 mb-3">
        Classificação da Não Conformidade
      </h2>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        {nc.local_nc && (
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Local</p>
            <p className="text-gray-800">{nc.local_nc}</p>
          </div>
        )}
        {nc.categoria_nc && (
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Categoria
            </p>
            <p className="text-gray-800">{nc.categoria_nc}</p>
          </div>
        )}
        {nc.parametro_nc && (
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Parâmetro
            </p>
            <p className="text-gray-800">{nc.parametro_nc}</p>
          </div>
        )}
      </div>
    </section>
  );
}