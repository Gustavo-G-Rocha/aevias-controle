import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';
import SignatureFooter from '@/components/relatorios/SignatureFooter';
import { formatDataChecklist, formatNumerico, formatTemperatura } from '@/utils/relatorioChecklistAplicacaoUtils';

const LOGO_FALLBACK = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

export default function MedicoesGeometricasPage({ checklist, regional, footerProps }) {
  const medicoes = checklist.medicoes_geometricas;
  if (!medicoes?.medicoes?.length) return null;

  return (
    <div className="break-before-page p-3 print:p-3 min-h-screen flex flex-col">
      <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1">
        <div className="flex justify-start">
          <picture>
            <source srcSet={regional?.logo_url || LOGO_FALLBACK} />
            <img src={regional?.logo_url || LOGO_FALLBACK} alt="Logo Regional" className="h-10 object-contain" width="auto" height="40" />
          </picture>
        </div>
        <div className="text-center">
          <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">Medição Geométrica de Campo</h1>
        </div>
        <div className="flex justify-end">
          <div className="border border-gray-400 p-1 rounded-md text-xs">
            <p className="font-semibold text-gray-800">{formatDataChecklist(checklist.data)}</p>
          </div>
        </div>
      </header>

      <ReportSectionTitle>Dados da Medição</ReportSectionTitle>
      <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 mb-0.5" style={{ fontSize: '9px' }}>
        <div><p className="font-bold">EMPREITEIRA:</p><p>{checklist.empreiteira || 'N/A'}</p></div>
        <div><p className="font-bold">TRECHO:</p><p>{checklist.trecho || 'N/A'}</p></div>
        <div><p className="font-bold">SERVIÇO:</p><p>{medicoes.servico || 'N/A'}</p></div>
        <div><p className="font-bold">RODOVIA:</p><p>{checklist.rodovia || 'N/A'}</p></div>
        <div><p className="font-bold">SUBTRECHO:</p><p>{medicoes.subtrecho || 'N/A'}</p></div>
        <div><p className="font-bold">FISCAL DE CAMPO:</p><p>{checklist.inspetor_campo || 'N/A'}</p></div>
      </div>

      <div className="flex-grow overflow-auto">
        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-400 p-1" colSpan="2">ESTACAS</th>
              <th className="border border-slate-400 p-1" rowSpan="2">LADO</th>
              <th className="border border-slate-400 p-1" rowSpan="2">FAIXA</th>
              <th className="border border-slate-400 p-1" colSpan="3">GEOMÉTRICO</th>
              <th className="border border-slate-400 p-1" rowSpan="2">PLACA</th>
              <th className="border border-slate-400 p-1" rowSpan="2">QUANT.</th>
              <th className="border border-slate-400 p-1" rowSpan="2">TEMPERATURA</th>
              <th className="border border-slate-400 p-1" rowSpan="2">OBSERVAÇÕES</th>
            </tr>
            <tr>
              <th className="border border-slate-400 p-1">INICIAL</th>
              <th className="border border-slate-400 p-1">FINAL</th>
              <th className="border border-slate-400 p-1">COMP.</th>
              <th className="border border-slate-400 p-1">LARG.</th>
              <th className="border border-slate-400 p-1">ALTURA</th>
            </tr>
          </thead>
          <tbody>
            {medicoes.medicoes.map((medicao, index) => (
              <tr key={`medicao-geom-${index}`} className="even:bg-slate-50">
                <td className="border border-slate-400 p-1 text-center">{medicao.estaca_inicial || '-'}</td>
                <td className="border border-slate-400 p-1 text-center">{medicao.estaca_final || '-'}</td>
                <td className="border border-slate-400 p-1 text-center">{medicao.lado || '-'}</td>
                <td className="border border-slate-400 p-1 text-center">{medicao.faixa || '-'}</td>
                <td className="border border-slate-400 p-1 text-center">{formatNumerico(medicao.comprimento)}</td>
                <td className="border border-slate-400 p-1 text-center">{formatNumerico(medicao.largura)}</td>
                <td className="border border-slate-400 p-1 text-center">{formatNumerico(medicao.altura)}</td>
                <td className="border border-slate-400 p-1 text-center">{medicao.placa || '-'}</td>
                <td className="border border-slate-400 p-1 text-center">{formatNumerico(medicao.quantidade)}</td>
                <td className="border border-slate-400 p-1 text-center">{formatTemperatura(medicao.temperatura)}</td>
                <td className="border border-slate-400 p-1 text-xs">{medicao.observacoes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-6">
        <SignatureFooter {...footerProps} />
      </footer>
    </div>
  );
}