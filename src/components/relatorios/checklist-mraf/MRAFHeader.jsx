import React from 'react';
import { ReportSectionTitle } from '../shared';

const SectionTitle = ({ children }) => <ReportSectionTitle size="sm">{children}</ReportSectionTitle>;

const LOGO_DEFAULT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function MRAFHeader({ checklist, obra, regional, project }) {
  return (
    <div>
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
      <main className="text-sm mt-0.5">
        <SectionTitle>Dados da Obra</SectionTitle>
        <div className="grid grid-cols-4 gap-x-2 gap-y-1" style={{ fontSize: '9px' }}>
          <div>
            <p className="font-bold">CLIENTE:</p>
            <p>{regional?.cliente || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold">TRECHO:</p>
            <p>{checklist.trecho}</p>
          </div>
          <div>
            <p className="font-bold">PROJETO UTILIZADO:</p>
            <p>{project?.name || checklist.projeto_utilizado || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold">PEDREIRA:</p>
            <p>{checklist.pedreira || 'N/A'}</p>
          </div>

          <div>
            <p className="font-bold">OBRA:</p>
            <p>{obra?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold">EMPREITEIRA:</p>
            <p>{checklist.empreiteira || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold">FAIXA ESPECIFICADA:</p>
            <p>{checklist.faixa_especificada || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold">FISCAL DE CAMPO:</p>
            <p>{checklist.inspetor_campo || checklist.laboratorista_name || 'N/A'}</p>
          </div>

          <div>
            <p className="font-bold">RODOVIA:</p>
            <p>{checklist.rodovia}</p>
          </div>
          <div>
            <p className="font-bold">ENSAIO REALIZADO POR:</p>
            <p>{checklist.ensaio_realizado_por || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold">LIGANTE:</p>
            <p>{checklist.ligante || 'N/A'}</p>
          </div>

          {checklist.jornada?.horario_inicio && checklist.jornada?.horario_fim && (
            <div>
              <p className="font-bold">JORNADA:</p>
              <p>{checklist.jornada.horario_inicio} - {checklist.jornada.horario_fim}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}