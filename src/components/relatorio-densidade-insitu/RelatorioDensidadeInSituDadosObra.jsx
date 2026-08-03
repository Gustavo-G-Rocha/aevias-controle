import React from 'react';
import { formatDate } from '@/utils/relatorioDensidadeInSituUtils';

export default function RelatorioDensidadeInSituDadosObra({ ensaio, obra, regional }) {
  return (
    <div className="mb-2">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-2 py-0.5 font-bold text-center mb-0 text-xs">
        DADOS DA OBRA
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 mb-0 text-[10px]">
        <div>
          <p className="font-bold text-gray-700">CLIENTE:</p>
          <p className="text-gray-900">{regional?.cliente || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">MATERIAL:</p>
          <p className="text-gray-900">{ensaio.material || ''}</p>
        </div>

        <div>
          <p className="font-bold text-gray-700">OBRA:</p>
          <p className="text-gray-900">{obra?.name || ensaio.obra_name || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">PROCEDÊNCIA:</p>
          <p className="text-gray-900">{ensaio.procedencia || ''}</p>
        </div>

        <div>
          <p className="font-bold text-gray-700">RODOVIA:</p>
          <p className="text-gray-900">{ensaio.rodovia || ''}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">DATA:</p>
          <p className="text-gray-900">{formatDate(ensaio.data_ensaio)}</p>
        </div>

        <div>
          <p className="font-bold text-gray-700">TRECHO:</p>
          <p className="text-gray-900">{ensaio.trecho || ''}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">HORÁRIO:</p>
          <p className="text-gray-900">{ensaio.horario || ''}</p>
        </div>

        <div>
          <p className="font-bold text-gray-700">CAMADA:</p>
          <p className="text-gray-900">{ensaio.camada || ''}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">LABORATORISTA:</p>
          <p className="text-gray-900">{ensaio.laboratorista_name || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}