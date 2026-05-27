import React from 'react';
import SectionTitleTerra from './SectionTitleTerra';
import EnsaioRow from './EnsaioRow';
import EnsaioSimpleRow from './EnsaioSimpleRow';

export default function EnsaiosTable({ ensaios_empreiteira, umidade, checklist }) {
  if (!ensaios_empreiteira) return null;

  return (
    <>
      <SectionTitleTerra>Ensaios da Camada Realizados pela Empreiteira</SectionTitleTerra>
      <table className="w-full border-collapse border border-slate-300 mb-0.5">
        <thead className="bg-white">
          <tr style={{ height: '19.6px' }}>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-left text-xs">Ensaios</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-14 text-xs">Realizado</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-10 text-xs">Qtde</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center text-xs">Resultados</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-16 text-xs">Conforme</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-20 text-xs">Não Conforme</th>
          </tr>
        </thead>
        <tbody>
          {/* Compactação - Proctor */}
          <EnsaioRow
            label="Compactação - Proctor (g/cm³)"
            ensaio={ensaios_empreiteira.compactacao_proctor}
            showConformidade={false}
          />

          {/* Umidade Ótima */}
          <EnsaioSimpleRow
            label="Umidade Ótima (%)"
            realizado={umidade.otima_quantidade}
            quantidade={umidade.otima_quantidade}
            resultados={umidade.otima_resultados}
          />

          {/* ISC */}
          <EnsaioRow label="ISC - Índice de Suporte Califórnia (%)" ensaio={ensaios_empreiteira.isc} />

          {/* Massa Específica In Situ */}
          <EnsaioRow label="Massa Específica In Situ (g/cm³)" ensaio={ensaios_empreiteira.massa_especifica_in_situ} />

          {/* Umidade In Situ */}
          <EnsaioSimpleRow
            label="Umidade In Situ (%)"
            realizado={umidade.in_situ_quantidade}
            quantidade={umidade.in_situ_quantidade}
            resultados={umidade.in_situ_resultados}
          />

          {/* Análise Granulométrica */}
          <EnsaioRow label="Análise Granulométrica por Peneiramento" ensaio={ensaios_empreiteira.granulometria} />

          {/* Variação de Umidade */}
          <EnsaioRow
            label="Variação de Umidade (%)"
            ensaio={ensaios_empreiteira.variacao_umidade}
            isCalculated={true}
          />

          {/* Grau de Compactação */}
          <EnsaioRow
            label="Grau de Compactação (%)"
            ensaio={ensaios_empreiteira.grau_compactacao}
            isCalculated={true}
          />
        </tbody>
      </table>
    </>
  );
}