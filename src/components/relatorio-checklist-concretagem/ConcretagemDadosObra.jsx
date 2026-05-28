import React from 'react';

/**
 * Bloco "DADOS DA OBRA" para o relatório de concretagem.
 * Exibe cliente, concreteira, empreiteira, obra, rodovia, trecho, volume, fck e estrutura.
 */
export default function ConcretagemDadosObra({ checklist, obra, regional }) {
  const cliente = regional?.cliente || obra?.name || 'N/A';

  return (
    <div className="mb-3 text-[9px]">
      <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold mb-1 text-center">
        DADOS DA OBRA
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-1">
        <div>
          <p className="font-bold text-gray-700">CLIENTE:</p>
          <p className="text-gray-900">{cliente}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">CONCRETEIRA:</p>
          <p className="text-gray-900">{checklist.concreteira || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">EMPREITEIRA:</p>
          <p className="text-gray-900">{checklist.empreiteira || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">OBRA:</p>
          <p className="text-gray-900">{obra?.code || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">RODOVIA:</p>
          <p className="text-gray-900">{checklist.rodovia || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">TRECHO:</p>
          <p className="text-gray-900">{checklist.trecho || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">VOLUME (m³):</p>
          <p className="text-gray-900">{checklist.volume || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">Fck (MPa):</p>
          <p className="text-gray-900">{checklist.fck || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">ESTRUTURA:</p>
          <p className="text-gray-900">{checklist.estrutura || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}