/**
 * Seção de dados da obra.
 */
import React from 'react';
import {
  getNomeMaterial,
  getNomeProjetoExibir,
  getNomeFaixa,
} from '@/utils/relatorioGranuMisturaUtils';
import SectionHeader from './SectionHeader';

export default function GranuMistraDadosObra({
  record,
  project,
  faixa,
  obra,
  regional,
}) {
  return (
    <>
      <SectionHeader label="DADOS DA OBRA" />
      <div className="border border-slate-400 text-[10px]">
        <div className="grid grid-cols-4 gap-0">
          <div className="px-2 py-0.5 font-semibold bg-white">CLIENTE:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">OBRA:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">RODOVIA:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">TRECHO:</div>
          <div className="px-2 py-1 bg-white">
            {regional?.cliente || '—'}
          </div>
          <div className="px-2 py-1 bg-white">{obra?.name || '—'}</div>
          <div className="px-2 py-1 bg-white">{record.rodovia || '—'}</div>
          <div className="px-2 py-1 bg-white">{record.trecho || '—'}</div>

          <div className="px-2 py-0.5 font-semibold bg-white">CAMADA:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">MATERIAL:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">PEDREIRA:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">
            LOCAL DE COLETA:
          </div>
          <div className="px-2 py-1 bg-white">{record.camada || '—'}</div>
          <div className="px-2 py-1 bg-white">
            {getNomeMaterial(record)}
          </div>
          <div className="px-2 py-1 bg-white">{record.pedreira || '—'}</div>
          <div className="px-2 py-1 bg-white">
            {record.local_coleta || '—'}
          </div>

          <div className="px-2 py-0.5 font-semibold bg-white">Nº PROJETO:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">FAIXA:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">HORÁRIO:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">LABORATORISTA:</div>
          <div className="px-2 py-1 bg-white">
            {getNomeProjetoExibir(record, project)}
          </div>
          <div className="px-2 py-1 bg-white">
            {getNomeFaixa(faixa, record.faixa)}
          </div>
          <div className="px-2 py-1 bg-white">{record.horario || '—'}</div>
          <div className="px-2 py-1 bg-white">
            {record.laboratorista_name || '—'}
          </div>
        </div>
      </div>
    </>
  );
}