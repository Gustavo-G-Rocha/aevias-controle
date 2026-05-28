import React from 'react';
import { ReportCheckmark } from '../shared';
import { ReportSectionTitle } from '../shared';

const Checkmark = ({ checked }) => <ReportCheckmark checked={checked === true ? true : checked === false ? false : null} />;
const XMark = ({ checked }) => checked === false ? <span className="font-bold text-sm text-red-600">✗</span> : <span className="text-slate-500 text-sm">-</span>;
const SectionTitle = ({ children }) => <ReportSectionTitle size="sm">{children}</ReportSectionTitle>;

export default function CondicionamentoInsumos({ data }) {
  return (
    <div className="break-inside-avoid">
      <SectionTitle>Condicionamento dos Insumos</SectionTitle>
      <table className="w-full border-collapse" style={{ fontSize: '9px' }}>
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-0.5 py-0.5 text-left">Serviço</th>
            <th className="border border-slate-300 px-0.5 py-0.5 text-center" style={{ width: '35px' }}>Sim</th>
            <th className="border border-slate-300 px-0.5 py-0.5 text-center" style={{ width: '35px' }}>Não</th>
            <th className="border border-slate-300 px-0.5 py-0.5 text-left">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Agregados separados no canteiro?</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.agregados_separados} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.agregados_separados} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5" rowSpan="5">{data?.observacoes || '-'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Agregados devidamente cobertos?</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.agregados_cobertos} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.agregados_cobertos} /></td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Filler utilizado:</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center bg-slate-50" colSpan="2">{data?.filler_utilizado || 'N/A'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Utilização de aditivos?</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.utilizacao_aditivos} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.utilizacao_aditivos} /></td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Água contaminada?</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.agua_contaminada} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.agua_contaminada} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}