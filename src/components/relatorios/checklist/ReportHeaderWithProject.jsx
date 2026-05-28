import React from 'react';
import ReportHeader from './ReportHeader';
import { ReportSectionTitle } from '../shared';

/**
 * Cabeçalho com informações da obra e projeto
 * Combina logo/data com grid de metadados
 */
export default function ReportHeaderWithProject({ regional, checklist, obra, project }) {
  return (
    <div>
      <ReportHeader regional={regional} title="Controle Tecnológico de Usinagem" checklist={checklist} />
      <main className="text-base print:text-base mt-2">
        <ReportSectionTitle>Dados da Obra e Projeto</ReportSectionTitle>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2">
          <div><p className="font-bold">CLIENTE:</p><p>{regional?.cliente || 'N/A'}</p></div>
          <div><p className="font-bold">PROJETO:</p><p>{project?.name || checklist.projeto_utilizado || 'N/A'}</p></div>
          <div><p className="font-bold">PEDREIRA:</p><p>{checklist.pedreira || 'N/A'}</p></div>
          <div><p className="font-bold">INSPETOR:</p><p>{checklist.inspetor_campo || 'N/A'}</p></div>
          <div><p className="font-bold">OBRA:</p><p>{obra?.name || 'N/A'}</p></div>
          <div><p className="font-bold">FAIXA ESPECIFICADA:</p><p>{checklist.faixa_especificada || 'N/A'}</p></div>
          <div><p className="font-bold">ENSAIO REALIZADO POR:</p><p>{checklist.ensaio_realizado_por || 'N/A'}</p></div>
          <div>
            <p className="font-bold">JORNADA:</p>
            <p>{checklist.jornada?.horario_inicio && checklist.jornada?.horario_fim
              ? `${checklist.jornada.horario_inicio} - ${checklist.jornada.horario_fim}`
              : 'N/A'}
            </p>
          </div>
          <div><p className="font-bold">USINA:</p><p>{checklist.usina}</p></div>
          <div><p className="font-bold">LIGANTE:</p><p>{checklist.ligante || 'N/A'}</p></div>
        </div>
      </main>
    </div>
  );
}