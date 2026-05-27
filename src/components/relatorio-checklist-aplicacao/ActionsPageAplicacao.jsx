import React from 'react';
import { ReportSectionTitle, ReportNaoConformidadesTable } from '@/components/relatorios/shared';
import SignatureFooter from '@/components/relatorios/SignatureFooter';
import HeaderAplicacao from './HeaderAplicacao';

export default function ActionsPageAplicacao({ checklist, obra, regional, temAcoes, footerProps }) {
  const temNC = checklist.nao_conformidades && checklist.nao_conformidades.length > 0;
  if (!temAcoes && !temNC) return null;

  return (
    <div className="p-3 print:p-3 break-before-page relative" style={{ minHeight: '297mm', height: '297mm' }}>
      <div className="w-full max-w-[190mm] mx-auto relative" style={{ height: '100%' }}>
        <HeaderAplicacao checklist={checklist} obra={obra} regional={regional} />
        <main className="mt-2">
          {temAcoes && (
            <>
              <ReportSectionTitle>Ações Corretivas</ReportSectionTitle>
              <div className="border-2 border-slate-400 rounded p-6 bg-white" style={{ minHeight: '500px' }}>
                <p className="font-bold text-base mb-4 text-slate-800">AÇÕES CORRETIVAS APONTADAS:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {checklist.acoes_corretivas_descricao}
                </p>
              </div>
            </>
          )}
          {temNC && (
            <div className="mt-4">
              <ReportSectionTitle>Não Conformidades</ReportSectionTitle>
              <ReportNaoConformidadesTable naoConformidades={checklist.nao_conformidades} />
            </div>
          )}
        </main>
        <div className="absolute bottom-0 left-0 right-0 pt-1 break-inside-avoid">
          <SignatureFooter {...footerProps} />
        </div>
      </div>
    </div>
  );
}