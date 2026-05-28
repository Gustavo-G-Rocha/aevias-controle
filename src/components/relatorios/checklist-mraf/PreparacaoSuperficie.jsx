import React from 'react';
import { ReportCheckmark, ReportSectionTitle } from '../shared';

const Checkmark = ({ checked }) => <ReportCheckmark checked={checked === true ? true : checked === false ? false : null} />;
const XMark = ({ checked }) => checked === false ? <span className="font-bold text-sm text-red-600">✗</span> : <span className="text-slate-500 text-sm">-</span>;
const SectionTitle = ({ children }) => <ReportSectionTitle size="sm">{children}</ReportSectionTitle>;

export default function PreparacaoSuperficie({ data }) {
  return (
    <div className="break-inside-avoid">
      <SectionTitle>Acompanhamento da Condição e Preparação da Superfície</SectionTitle>
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
            <td className="border border-slate-300 px-0.5 py-0.5">Superfície úmida?</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.superficie_umida} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.superficie_umida} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5" rowSpan="5">{data?.observacoes || '-'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Temperatura do pavimento:</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center bg-slate-50" colSpan="2">
              {data?.temperatura_pavimento ? `${data.temperatura_pavimento} °C` : 'N/A'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Pavimento apresenta patologias?</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.pavimento_patologias} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.pavimento_patologias} /></td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">Superfície fresada? (Se sim acima)</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.superficie_fresada} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.superficie_fresada} /></td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-0.5 py-0.5">A superfície foi limpa antes da aplicação?</td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><Checkmark checked={data?.superficie_limpa} /></td>
            <td className="border border-slate-300 px-0.5 py-0.5 text-center"><XMark checked={data?.superficie_limpa} /></td>
          </tr>
        </tbody>
      </table>
      <p className="text-[7px] italic text-slate-600 mt-0.5">*Preferencialmente por vassouras mecânicas, podendo ser usados, também, processos manuais.</p>
    </div>
  );
}