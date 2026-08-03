import React from 'react';

export default function RelatorioTaxaMRAFDadosObra({ ensaio, obra, regional }) {
  return (
    <div className="mb-3">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-2 py-1 font-bold text-center mb-0 text-xs">DADOS DA OBRA</div>
      <div className="grid grid-cols-4 gap-x-4 text-[10px] border border-t-0 border-slate-300 px-2 py-2">
        <div className="space-y-2">
          <div>
            <p className="font-bold text-gray-700">CLIENTE:</p>
            <p className="text-gray-900">{regional?.cliente || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-gray-700">OBRA:</p>
            <p className="text-gray-900">{obra?.name || ensaio.obra_name || 'N/A'}{obra?.code ? ` (${obra.code})` : (ensaio.obra_code ? ` (${ensaio.obra_code})` : '')}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="font-bold text-gray-700">RODOVIA:</p>
            <p className="text-gray-900">{ensaio?.rodovia || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-gray-700">TRECHO:</p>
            <p className="text-gray-900">{ensaio?.trecho || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="font-bold text-gray-700">Nº DO PROJETO:</p>
            <p className="text-gray-900">{ensaio?.numero_projeto || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-gray-700">FAIXA ESPECIFICADA:</p>
            <p className="text-gray-900">{ensaio?.faixa_especificada || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="font-bold text-gray-700">PLACA CAMINHÃO:</p>
            <p className="text-gray-900">{ensaio?.placa_caminhao || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-gray-700">LABORATORISTA:</p>
            <p className="text-gray-900">{ensaio?.laboratorista_name || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}