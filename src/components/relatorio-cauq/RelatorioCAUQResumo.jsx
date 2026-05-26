import React from 'react';

/**
 * Seção "DADOS DA OBRA" do relatório CAUQ.
 */
export default function RelatorioCAUQResumo({ ensaio, obra, regional, project, faixa }) {
  return (
    <>
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-1 py-0 font-bold text-center mb-0 text-[8px] leading-tight">
        DADOS DA OBRA
      </div>

      <div className="grid grid-cols-5 gap-x-1 gap-y-0 mb-0 text-[9px] leading-tight">
        {/* Linha 1 */}
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">CLIENTE:</p>
          <p className="text-gray-900">{regional?.cliente || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">TRECHO:</p>
          <p className="text-gray-900">{ensaio.trecho || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">Nº PROJETO:</p>
          <p className="text-gray-900">{project?.name || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">PLACA CAMINHÃO:</p>
          <p className="text-gray-900">{ensaio.placa_caminhao || 'N/A'}</p>
        </div>
        <div className="col-span-1 row-span-3 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">ENSAIO REALIZADO POR:</p>
          <p className="text-gray-900">{ensaio.ensaio_realizado_por || 'N/A'}</p>
        </div>

        {/* Linha 2 */}
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">OBRA:</p>
          <p className="text-gray-900">{obra?.name || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">LOCAL DE COLETA:</p>
          <p className="text-gray-900">{ensaio.local_coleta || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">FAIXA ESPECIFICADA:</p>
          <p className="text-gray-900">{faixa?.nome || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">LABORATORISTA:</p>
          <p className="text-gray-900">{ensaio.laboratorista_name || 'N/A'}</p>
        </div>

        {/* Linha 3 */}
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">RODOVIA:</p>
          <p className="text-gray-900">{ensaio.rodovia || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">USINA FORNECEDORA:</p>
          <p className="text-gray-900">{ensaio.usina_fornecedora || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">PEDREIRA:</p>
          <p className="text-gray-900">{ensaio.pedreira || 'N/A'}</p>
        </div>
        <div className="col-span-1 mb-0.5">
          <p className="font-bold text-gray-700 mb-0">HORÁRIO:</p>
          <p className="text-gray-900">{ensaio.horario || 'N/A'}</p>
        </div>
      </div>
    </>
  );
}