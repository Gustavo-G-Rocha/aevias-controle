import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';

const CheckmarkColumn = ({ isYes, isNo, isNA }) => {
  if (isYes) return <span className="text-green-600 font-bold">X</span>;
  if (isNo)  return <span className="text-red-600 font-bold">X</span>;
  if (isNA)  return <span className="text-gray-600 font-bold">X</span>;
  return <span className="text-gray-400">-</span>;
};

export default function ReciclagemAcompanhamentoExecucao({ data = {} }) {
  const d = data || {};

  return (
    <div className="overflow-x-auto mb-1.5">
      <ReportSectionTitle size="sm">ACOMPANHAMENTO EXECUÇÃO DA CAMADA</ReportSectionTitle>
      <table className="w-full border-collapse border border-slate-300 text-[9px]">
        <thead>
          <tr className="bg-white">
            <th className="border border-slate-300 px-1 py-1 text-left font-medium">Controle</th>
            <th className="border border-slate-300 px-1 py-1 text-center font-medium w-9">Sim</th>
            <th className="border border-slate-300 px-1 py-1 text-center font-medium w-9">Não</th>
            <th className="border border-slate-300 px-1 py-1 text-center font-medium w-9">N/A</th>
            <th className="border border-slate-300 px-1 py-1 text-left font-medium">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-1 py-1 bg-white">Foi realizado remoção de material existente?</td>
            <td className="border border-slate-300 px-1 py-1 text-center"><CheckmarkColumn isYes={d.remocao_material_existente?.sim} /></td>
            <td className="border border-slate-300 px-1 py-1 text-center"><CheckmarkColumn isNo={d.remocao_material_existente?.nao} /></td>
            <td className="border border-slate-300 px-1 py-1 text-center"><CheckmarkColumn isNA={d.remocao_material_existente?.na} /></td>
            <td className="border border-slate-300 px-1 py-1">
              KM DO BOTA FORA: {d.remocao_material_existente?.km_bota_fora || '-'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-1 py-1 bg-white">Foi espalhado material novo para construção da camada?</td>
            <td className="border border-slate-300 px-1 py-1 text-center"><CheckmarkColumn isYes={d.espalhamento_material_novo?.sim} /></td>
            <td className="border border-slate-300 px-1 py-1 text-center"><CheckmarkColumn isNo={d.espalhamento_material_novo?.nao} /></td>
            <td className="border border-slate-300 px-1 py-1 text-center"><CheckmarkColumn isNA={d.espalhamento_material_novo?.na} /></td>
            <td className="border border-slate-300 px-1 py-1">TIPO DE MATERIAL: Pó de pedra</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-1 py-1.5 bg-white">
              A compactação da camada foi realizada em conformidade à energia de projeto?
              <div className="flex gap-0.5 mt-0" style={{ fontSize: '6px' }}>
...
              </div>
            </td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isYes={d.compactacao_conforme_projeto?.sim} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNo={d.compactacao_conforme_projeto?.nao} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNA={d.compactacao_conforme_projeto?.na} /></td>
            <td className="border border-slate-300 px-1 py-1.5"></td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-1 py-1.5 bg-white">Foi realizado ensaio de viga Benkelman para liberação da camada?</td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isYes={d.ensaio_viga_benkelman?.sim} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNo={d.ensaio_viga_benkelman?.nao} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNA={d.ensaio_viga_benkelman?.na} /></td>
            <td className="border border-slate-300 px-1 py-1.5">25 cm</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-1 py-1.5 bg-white">Espessura Reciclada?</td>
            <td className="border border-slate-300 px-1 py-1.5 text-center" colSpan="4">
              {d.espessura_reciclada || '-'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-1 py-1.5 bg-white">Foi realizado teste de carga para liberação da camada?</td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isYes={d.teste_carga?.sim} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNo={d.teste_carga?.nao} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNA={d.teste_carga?.na} /></td>
            <td className="border border-slate-300 px-1 py-1.5"></td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-1 py-1.5 bg-white">Há algum ponto de falha de compactação (borrachudo)?</td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isYes={d.falha_compactacao?.sim} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNo={d.falha_compactacao?.nao} /></td>
            <td className="border border-slate-300 px-1 py-1.5 text-center"><CheckmarkColumn isNA={d.falha_compactacao?.na} /></td>
            <td className="border border-slate-300 px-1 py-1.5"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}