import React from 'react';
import { ReportCheckmark, ReportSectionTitle } from '../shared';

const Checkmark = ({ checked }) => <ReportCheckmark checked={checked === true ? true : checked === false ? false : null} />;
const XMark = ({ checked }) => checked === false ? <span className="font-bold text-sm text-red-600">✗</span> : <span className="text-slate-500 text-sm">-</span>;
const SectionTitle = ({ children }) => <ReportSectionTitle size="sm">{children}</ReportSectionTitle>;

function ResultadoCell({ campo }) {
  return (
    <td className={`border border-slate-300 px-0.5 py-0.5 ${campo?.conforme === false ? 'text-red-600 font-bold' : ''}`}>
      {campo?.resultado || '-'}
      {campo?.conforme === false && ' ⚠️'}
    </td>
  );
}

export default function AcompanhamentoAplicacao({ data }) {
  return (
    <div className="break-inside-avoid">
      <SectionTitle>Acompanhamento da Aplicação</SectionTitle>
      <table className="w-full border-collapse text-center" style={{ fontSize: '9px' }}>
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-0.5 py-0.5">Serviço</th>
            <th className="border border-slate-300 px-0.5 py-0.5" style={{ width: '35px' }}>Sim</th>
            <th className="border border-slate-300 px-0.5 py-0.5" style={{ width: '35px' }}>Não</th>
            <th className="border border-slate-300 px-0.5 py-0.5">Resultado</th>
            <th className="border border-slate-300 px-0.5 py-0.5">Limites DNIT 035/2018</th>
            <th className="border border-slate-300 px-0.5 py-0.5">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5 text-left">Aguardado tempo necessário para rompimento/cura?</td>
            <td className="border border-slate-300 px-0.5 py-0.5"><Checkmark checked={data?.tempo_rompimento_cura?.realizado} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5"><XMark checked={data?.tempo_rompimento_cura?.realizado} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 bg-slate-50">N/A</td>
            <td className="border border-slate-300 px-0.5 py-0.5 bg-slate-50">N/A</td>
            <td className="border border-slate-300 px-0.5 py-0.5" rowSpan="4">{data?.observacoes || '-'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5 text-left">Taxa de Aplicação</td>
            <td className="border border-slate-300 px-0.5 py-0.5"><Checkmark checked={data?.taxa_aplicacao?.realizado} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5"><XMark checked={data?.taxa_aplicacao?.realizado} /></td>
            <ResultadoCell campo={data?.taxa_aplicacao} />
            <td className="border border-slate-300 px-0.5 py-0.5">8 kg/m² a 16 kg/m²</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5 text-left">Resíduo da Emulsão</td>
            <td className="border border-slate-300 px-0.5 py-0.5"><Checkmark checked={data?.residuo_emulsao?.realizado} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5"><XMark checked={data?.residuo_emulsao?.realizado} /></td>
            <ResultadoCell campo={data?.residuo_emulsao} />
            <td className="border border-slate-300 px-0.5 py-0.5">6,5% a 12,0%</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5 text-left">Espessura da Camada</td>
            <td className="border border-slate-300 px-0.5 py-0.5"><Checkmark checked={data?.espessura_camada?.realizado} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5"><XMark checked={data?.espessura_camada?.realizado} /></td>
            <ResultadoCell campo={data?.espessura_camada} />
            <td className="border border-slate-300 px-0.5 py-0.5">6 mm a 20 mm</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}