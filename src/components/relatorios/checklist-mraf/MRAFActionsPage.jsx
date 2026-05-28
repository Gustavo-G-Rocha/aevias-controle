import React from 'react';
import SignatureFooter from '../SignatureFooter';
import { ReportSectionTitle } from '../shared';

const SectionTitle = ({ children }) => <ReportSectionTitle size="sm">{children}</ReportSectionTitle>;

const LOGO_DEFAULT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function MRAFActionsPage({ checklist, obra, regional, project }) {
  return (
    <div className="break-before-page relative p-3 print:p-3" style={{ minHeight: '297mm', height: '297mm' }}>
      <div className="w-full max-w-[190mm] mx-auto relative" style={{ height: '100%' }}>
        <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-0.5 mb-1">
          <div className="flex justify-start">
            <picture>
              <source srcSet={regional?.logo_url || LOGO_DEFAULT} />
              <img src={regional?.logo_url || LOGO_DEFAULT} alt="Logo Regional" className="h-8 object-contain" width="auto" height="32" />
            </picture>
          </div>
          <div className="text-center">
            <h1 className="text-xs font-bold text-gray-800">Controle Tecnológico - Aplicação de Microrrevestimento</h1>
          </div>
          <div className="flex justify-end">
            <div className="border border-gray-400 p-0.5 rounded-md text-[10px]">
              <p className="font-semibold text-gray-800">
                {new Date(checklist.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </p>
            </div>
          </div>
        </header>

        <main className="mt-2">
          {checklist.acoes_corretivas_realizado === true && checklist.acoes_corretivas_descricao && (
            <>
              <SectionTitle>Ações Corretivas</SectionTitle>
              <div className="border-2 border-slate-400 rounded p-6 bg-white" style={{ minHeight: '500px' }}>
                <p className="font-bold text-base mb-4 text-slate-800">AÇÕES CORRETIVAS APONTADAS:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {checklist.acoes_corretivas_descricao}
                </p>
              </div>
            </>
          )}

          {checklist.nao_conformidades && checklist.nao_conformidades.length > 0 && (
            <div className="mt-4">
              <SectionTitle>Não Conformidades</SectionTitle>
              <table className="w-full border-collapse border border-slate-300 text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">LOCAL</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">CATEGORIA</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">PARÂMETRO</th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.nao_conformidades.map((nc, index) => (
                    <tr key={index} className="bg-white">
                      <td className="border border-slate-300 px-3 py-2 text-slate-800">{nc.local_nc || 'N/A'}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-800">{nc.categoria_nc || 'N/A'}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-800">{nc.parametro_nc || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        <div className="absolute bottom-0 left-0 right-0 pt-1 break-inside-avoid">
          <SignatureFooter
            labName={checklist.laboratorista_name}
            labEmail={checklist.created_by}
            labCreatedDate={checklist.created_date}
            labPosition="Laboratorista"
            approverName={checklist.approver_details?.name}
            approverEmail={checklist.approved_by}
            approverPosition={checklist.approver_details?.position}
            approverCREA={checklist.approver_details?.crea_number}
            approverDate={checklist.approved_date}
            clientName={checklist.client_signature?.engineer_name}
            clientEmail={checklist.client_signature?.signed_by}
            clientPosition={checklist.client_signature?.position}
            clientCREA={checklist.client_signature?.crea_number}
            clientDate={checklist.client_signature?.signed_date}
          />
        </div>
      </div>
    </div>
  );
}