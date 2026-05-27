import React from 'react';
import SectionTitleTerra from './SectionTitleTerra';
import CheckboxDisplay from './CheckboxDisplay';

const ACOMPANHAMENTO_ROWS = [
  {
    key: 'remocao_material_existente',
    label: 'Foi realizado remoção de material existente?',
  },
  {
    key: 'espalhamento_material_novo',
    label: 'Foi espalhado material novo para construção da camada?',
  },
  {
    key: 'compactacao_conforme_projeto',
    label: 'A compactação da camada foi realizada em conformidade à energia de projeto?',
    hasSubitems: true,
  },
  {
    key: 'ensaio_viga_benkelman',
    label: 'Foi realizado ensaio de viga Benkelman para liberação da camada?',
  },
  {
    key: 'teste_carga',
    label: 'Foi realizado teste de carga para liberação da camada?',
  },
  {
    key: 'falha_compactacao',
    label: 'Há algum ponto de falha de compactação (borrachudo)?',
  },
];

function RoloSubitems({ subitems }) {
  if (!subitems) return null;

  return (
    <div className="flex gap-1 mt-0.5 ml-1" style={{ fontSize: '7px' }}>
      {subitems.rolo_liso && (
        <span className="inline-block bg-blue-300 text-slate-700 px-1.5 py-0.5 rounded font-bold">✓ ROLO LISO</span>
      )}
      {subitems.rolo_pneu && (
        <span className="inline-block bg-blue-300 text-slate-700 px-1.5 py-0.5 rounded font-bold">✓ ROLO DE PNEU</span>
      )}
      {subitems.rolo_pe_carneiro && (
        <span className="inline-block bg-blue-300 text-slate-700 px-1.5 py-0.5 rounded font-bold">✓ ROLO PÉ DE CARNEIRO</span>
      )}
    </div>
  );
}

function AcompanhamentoRow({ row, value }) {
  return (
    <tr style={{ height: '19.6px' }}>
      <td className="border border-slate-300 px-1 py-0.5 bg-white">
        {row.label}
        {row.hasSubitems && <RoloSubitems subitems={value} />}
      </td>
      <td className="border border-slate-300 px-1 py-0.5 text-center">
        <CheckboxDisplay value={value} column="sim" />
      </td>
      <td className="border border-slate-300 px-1 py-0.5 text-center">
        <CheckboxDisplay value={value} column="nao" />
      </td>
      <td className="border border-slate-300 px-1 py-0.5 text-center">
        <CheckboxDisplay value={value} column="na" />
      </td>
    </tr>
  );
}

export default function AcompanhamentoExecucaoTable({ acompanhamento_execucao, observacoes }) {
  if (!acompanhamento_execucao) return null;

  return (
    <>
      <SectionTitleTerra>Acompanhamento Execução da Camada</SectionTitleTerra>
      <table className="w-full border-collapse border border-slate-300 text-xs mb-0.5">
        <thead className="bg-white">
          <tr style={{ height: '19.6px' }}>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-left">Controle</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-14">Sim</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-14">Não</th>
            <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-14">N/A</th>
          </tr>
        </thead>
        <tbody>
          {ACOMPANHAMENTO_ROWS.map((row) => (
            <AcompanhamentoRow
              key={row.key}
              row={row}
              value={acompanhamento_execucao[row.key]}
            />
          ))}
        </tbody>
      </table>

      {observacoes && (
        <>
          <SectionTitleTerra>Observações do Acompanhamento</SectionTitleTerra>
          <div className="text-xs mb-0.5 p-1 bg-white rounded border border-slate-300">
            {observacoes}
          </div>
        </>
      )}
    </>
  );
}