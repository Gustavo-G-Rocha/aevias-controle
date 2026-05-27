import React from 'react';

export default function RelatorioMRAFDadosObra({ ensaio, obra, project, regional, faixa }) {
  return (
    <>
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-3 py-2 font-bold text-center mb-2 text-[10px] leading-tight print:px-2 print:py-1 print:mb-1.5">
        DADOS DA OBRA
      </div>

      <div className="grid grid-cols-4 gap-x-3 gap-y-2 mb-3 text-[10px] leading-tight print:gap-x-2 print:gap-y-1.5 print:mb-2">
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">CLIENTE:</p>
          <p className="text-gray-900">{regional?.cliente || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">TRECHO:</p>
          <p className="text-gray-900">{ensaio?.trecho || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">Nº PROJETO:</p>
          <p className="text-gray-900">{project?.name || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">PLACA CAMINHÃO:</p>
          <p className="text-gray-900">{ensaio?.placa_caminhao || 'N/A'}</p>
        </div>

        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">OBRA:</p>
          <p className="text-gray-900">{obra?.name || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">LOCAL DE COLETA:</p>
          <p className="text-gray-900">{ensaio?.local_coleta || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">FAIXA ESPECIFICADA:</p>
          <p className="text-gray-900">{faixa?.nome || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">ENSAIO REALIZADO POR:</p>
          <p className="text-gray-900">{ensaio?.ensaio_realizado_por || 'N/A'}</p>
        </div>

        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">RODOVIA:</p>
          <p className="text-gray-900">{ensaio?.rodovia || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">PEDREIRA:</p>
          <p className="text-gray-900">{ensaio?.pedreira || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">LABORATORISTA:</p>
          <p className="text-gray-900">{ensaio?.laboratorista_name || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700 mb-1">HORÁRIO:</p>
          <p className="text-gray-900">{ensaio?.horario || 'N/A'}</p>
        </div>
      </div>
    </>
  );
}