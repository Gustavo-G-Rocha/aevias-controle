import React from 'react';
import HeaderTerra from './HeaderTerra';
import DadosObraTerra from './DadosObraTerra';
import SectionTitleTerra from './SectionTitleTerra';
import SignatureFooter from '../relatorios/SignatureFooter';
import { ReportNaoConformidadesTable } from '../relatorios/shared';

export default function ActionsPage({ checklist, regional, obra, temAcoes, temNC, footerProps }) {
  if (!temAcoes && !temNC) return null;

  return (
    <div className="break-before-page">
      <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none py-2 px-3 print:py-2 print:px-3">
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '270mm' }}>
          <HeaderTerra regional={regional} checklist={checklist} />
          <DadosObraTerra regional={regional} obra={obra} checklist={checklist} />

          <main className="mt-2" style={{ flex: '1' }}>
            {temAcoes && (
              <>
                <SectionTitleTerra>Ações Corretivas</SectionTitleTerra>
                <div className="border-2 border-slate-400 rounded p-6 bg-white" style={{ minHeight: '450px' }}>
                  <p className="font-bold text-base mb-4 text-slate-800">AÇÕES CORRETIVAS APONTADAS:</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {checklist.acoes_corretivas_descricao}
                  </p>
                </div>
              </>
            )}

            {temNC && (
              <div className="mt-4">
                <SectionTitleTerra>Não Conformidades</SectionTitleTerra>
                <ReportNaoConformidadesTable naoConformidades={checklist.nao_conformidades} />
              </div>
            )}
          </main>

          <div style={{ marginTop: 'auto' }}>
            <SignatureFooter {...footerProps} />
          </div>
        </div>
      </div>
    </div>
  );
}