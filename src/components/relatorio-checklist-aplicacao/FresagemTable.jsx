import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';
import CheckmarkColumn from './CheckmarkColumn';

export default function FresagemTable({ fresagem_preparacao }) {
  const fp = fresagem_preparacao || {};

  return (
    <>
      <ReportSectionTitle>Acompanhamento da Fresagem e Preparação da Superfície</ReportSectionTitle>
      <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '10px' }}>
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-slate-300 px-1 py-0.5 text-left font-medium">Serviço</th>
            <th className="border border-slate-300 px-1 py-0.5 text-center font-medium w-10">Sim</th>
            <th className="border border-slate-300 px-1 py-0.5 text-center font-medium w-10">Não</th>
            <th className="border border-slate-300 px-1 py-0.5 text-left font-medium">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 p-0.5">
              <strong>A superfície foi limpa após a fresagem?</strong>
              <p className="text-slate-600 italic" style={{ fontSize: '8px' }}>Preferencialmente por vassouras mecânicas, podendo ser usados, também, processos manuais.</p>
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.superficie_limpa} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.superficie_limpa} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5" rowSpan="4" style={{ fontSize: '8px' }}>
              {fp.observacoes || '-'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">
              <strong>Foi realizada a destinação do material fresado?</strong>
              <p className="text-slate-600 italic" style={{ fontSize: '8px' }}>(Informar local no campo de observações) Local definido pela concessionária para seu reaproveitamento ou bota-fora</p>
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.destinacao_material_fresado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.destinacao_material_fresado} isYesColumn={false} />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">
              <strong>O material solto foi removido por fresagem ou qualquer outro processo apropriado?</strong>
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.material_solto_removido} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.material_solto_removido} isYesColumn={false} />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">
              <strong>Pavimento fresado está em condições para pintura?</strong>
              <p className="text-slate-600 italic" style={{ fontSize: '8px' }}>(Limpo e sem excesso de umidade)</p>
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.pavimento_pronto_pintura} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={fp.pavimento_pronto_pintura} isYesColumn={false} />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}