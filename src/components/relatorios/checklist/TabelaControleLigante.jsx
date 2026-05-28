import React from 'react';
import { ReportSectionTitle } from '../shared';

const ENSAIOS_LIGANTE = [
  { label: (cl) => `Viscosidade Brookfield a ${cl?.viscosidade_1_temp || '-'}ºC, SP ${cl?.viscosidade_1_sp || '-'} [${cl?.viscosidade_1_rpm || '-'} rpm]`, unit: 'cP', resultKey: 'viscosidade_1_resultado', limiteKey: 'viscosidade_1_limite', conformeKey: 'viscosidade_1_conforme', norma: 'ABNT NBR - 15184' },
  { label: (cl) => `Viscosidade Brookfield a ${cl?.viscosidade_2_temp || '-'}ºC, SP ${cl?.viscosidade_2_sp || '-'} [${cl?.viscosidade_2_rpm || '-'} rpm]`, unit: 'cP', resultKey: 'viscosidade_2_resultado', limiteKey: 'viscosidade_2_limite', conformeKey: 'viscosidade_2_conforme', norma: 'ABNT NBR - 15529' },
  { label: (cl) => `Viscosidade Brookfield a ${cl?.viscosidade_3_temp || '-'}ºC, SP ${cl?.viscosidade_3_sp || '-'} [${cl?.viscosidade_3_rpm || '-'} rpm]`, unit: 'cP', resultKey: 'viscosidade_3_resultado', limiteKey: 'viscosidade_3_limite', conformeKey: 'viscosidade_3_conforme', norma: 'ABNT NBR - 15184' },
  { label: () => 'Recuperação Elástica', unit: '%', resultKey: 'recuperacao_elastica_resultado', limiteKey: 'recuperacao_elastica_limite', conformeKey: 'recuperacao_elastica_conforme', norma: 'ABNT NBR - 15086' },
  { label: () => 'Penetração (100g, 5s, 25ºC)', unit: '0,1 mm', resultKey: 'penetracao_resultado', limiteKey: 'penetracao_limite', conformeKey: 'penetracao_conforme', norma: 'ABNT NBR - 6576' },
  { label: () => 'Ponto de Amolecimento', unit: 'ºC', resultKey: 'ponto_amolecimento_resultado', limiteKey: 'ponto_amolecimento_limite', conformeKey: 'ponto_amolecimento_conforme', norma: 'ABNT NBR - 6560' },
  { label: () => 'Ponto de Fulgor', unit: 'ºC', resultKey: 'ponto_fulgor_resultado', limiteKey: 'ponto_fulgor_limite', conformeKey: 'ponto_fulgor_conforme', norma: 'ABNT NBR - 11341' },
];

const ConformidadeIcon = ({ conforme }) =>
  conforme
    ? <span className="text-green-600 font-bold text-2xl">✓</span>
    : <span className="text-red-600 font-bold text-2xl">✗</span>;

export default function TabelaControleLigante({ controle_ligante }) {
  const cl = controle_ligante || {};

  return (
    <div>
      <ReportSectionTitle>Controle de Qualidade de Ligantes</ReportSectionTitle>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <strong className="font-medium text-sm">Fornecedor:</strong>
          <p className="text-base">{cl.fornecedor || 'N/A'}</p>
        </div>
        <div>
          <strong className="font-medium text-sm">Nota Fiscal:</strong>
          <p className="text-base">{cl.nota_fiscal || 'N/A'}</p>
        </div>
        <div>
          <strong className="font-medium text-sm">Placa Carreta:</strong>
          <p className="text-base">{cl.placa_carreta || 'N/A'}</p>
        </div>
        <div>
          <strong className="font-medium text-sm">Quantidade:</strong>
          <p className="text-base">{cl.quantidade_toneladas ? `${cl.quantidade_toneladas} t` : 'N/A'}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-slate-400 text-sm mt-4">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 p-2 text-left font-semibold">Ensaio</th>
            <th className="border border-slate-300 p-2 text-center font-semibold">Unidade</th>
            <th className="border border-slate-300 p-2 text-center font-semibold">Resultado</th>
            <th className="border border-slate-300 p-2 text-center font-semibold">Limite Esp.</th>
            <th className="border border-slate-300 p-2 text-center font-semibold">Especificação</th>
            <th className="border border-slate-300 p-2 text-center font-semibold">Conformidade</th>
          </tr>
        </thead>
        <tbody>
          {ENSAIOS_LIGANTE.map((e, i) => (
            <tr key={i} className="even:bg-slate-50">
              <td className="border border-slate-300 p-2">{e.label(cl)}</td>
              <td className="border border-slate-300 p-2 text-center">{e.unit}</td>
              <td className="border border-slate-300 p-2 text-center font-semibold">{cl[e.resultKey] || '-'}</td>
              <td className="border border-slate-300 p-2 text-center bg-blue-50">{cl[e.limiteKey] || '-'}</td>
              <td className="border border-slate-300 p-2 text-center">{e.norma}</td>
              <td className="border border-slate-300 p-2 text-center">
                <ConformidadeIcon conforme={cl[e.conformeKey]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}