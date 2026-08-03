import React from 'react';
import SectionTitleTerra from './SectionTitleTerra';
import { formatarJornada } from '@/utils/relatorioChecklistTerraplanagemUtils';

export default function DadosObraTerra({ regional, obra, checklist }) {
  return (
    <>
      <SectionTitleTerra>Dados da Obra</SectionTitleTerra>
      <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 mb-0.5 p-1 rounded text-xs">
        <div>
          <p className="font-bold">CLIENTE:</p>
          <p>{regional?.cliente || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold">RODOVIA:</p>
          <p>{checklist.rodovia}</p>
        </div>
        <div>
          <p className="font-bold">MATERIAL:</p>
          <p>{checklist.material}</p>
        </div>
        <div>
          <p className="font-bold">EMPREITEIRA:</p>
          <p>{checklist.empreiteira}</p>
        </div>
        <div>
          <p className="font-bold">ESTACA:</p>
          <p>{checklist.estaca}</p>
        </div>
        <div>
          <p className="font-bold">INSPETOR FISC:</p>
          <p>{checklist.inspetor_fiscal || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold">OBRA:</p>
          <p>{obra?.name || checklist.obra_name || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold">CAMADA:</p>
          <p>{checklist.camada}</p>
        </div>
        <div>
          <p className="font-bold">JORNADA:</p>
          <p>{formatarJornada(checklist.jornada)}</p>
        </div>
        <div>
          <p className="font-bold">ENSAIO REALIZADO POR:</p>
          <p>{checklist.ensaio_realizado_por || 'N/A'}</p>
        </div>
        {(checklist.origem_material || checklist.nome_material) && (
          <>
            {checklist.origem_material && (
              <div>
                <p className="font-bold">ORIGEM DO MATERIAL:</p>
                <p>{checklist.origem_material}</p>
              </div>
            )}
            {checklist.nome_material && (
              <div>
                <p className="font-bold">NOME DO MATERIAL:</p>
                <p>{checklist.nome_material}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}