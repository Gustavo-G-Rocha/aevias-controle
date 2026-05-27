import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';
import { formatDataChecklist, formatarJornada } from '@/utils/relatorioChecklistAplicacaoUtils';

const LOGO_FALLBACK = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

export default function HeaderAplicacao({ checklist, obra, regional }) {
  const jornada = formatarJornada(checklist.jornada);

  return (
    <div>
      <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1">
        <div className="flex justify-start">
          <picture>
            <source srcSet={regional?.logo_url || LOGO_FALLBACK} />
            <img src={regional?.logo_url || LOGO_FALLBACK} alt="Logo Regional" className="h-10 object-contain" width="auto" height="40" />
          </picture>
        </div>
        <div className="text-center">
          <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">Controle Tecnológico de Aplicação</h1>
        </div>
        <div className="flex justify-end">
          <div className="border border-gray-400 p-1 rounded-md text-xs">
            <p className="font-semibold text-gray-800">{formatDataChecklist(checklist.data)}</p>
          </div>
        </div>
      </header>

      <main className="text-xs mt-0.5">
        <ReportSectionTitle>Dados da Obra</ReportSectionTitle>
        <div className="grid grid-cols-3 gap-x-3 gap-y-0.5" style={{ fontSize: '9px' }}>
          <div><p className="font-bold">CLIENTE:</p><p>{regional?.cliente || 'N/A'}</p></div>
          <div><p className="font-bold">PROJETO UTILIZADO:</p><p>{checklist.projeto_utilizado || 'N/A'}</p></div>
          <div><p className="font-bold">USINA:</p><p>{checklist.usina || 'N/A'}</p></div>
          <div><p className="font-bold">RODOVIA:</p><p>{checklist.rodovia}</p></div>
          <div><p className="font-bold">FAIXA ESPECIFICADA:</p><p>{checklist.faixa_especificada || 'N/A'}</p></div>
          <div><p className="font-bold">LABORATORISTA DE CAMPO:</p><p>{checklist.laboratorista_name || 'N/A'}</p></div>
          <div><p className="font-bold">TRECHO:</p><p>{checklist.trecho}</p></div>
          <div><p className="font-bold">LIGANTE:</p><p>{checklist.ligante || 'N/A'}</p></div>
          <div><p className="font-bold">OBRA:</p><p>{obra?.name || 'N/A'}</p></div>
          <div><p className="font-bold">PEDREIRA:</p><p>{checklist.pedreira || 'N/A'}</p></div>
          <div><p className="font-bold">ENSAIO REALIZADO POR:</p><p>{checklist.ensaio_realizado_por || 'N/A'}</p></div>
          <div><p className="font-bold">EMPREITEIRA:</p><p>{checklist.empreiteira || 'N/A'}</p></div>
          {jornada && (
            <div><p className="font-bold">JORNADA:</p><p>{jornada}</p></div>
          )}
        </div>
      </main>
    </div>
  );
}