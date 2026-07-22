import React from 'react';

export default function RelatorioVigaBenkelmanDadosObra({ ensaio, obra, regional, faixaNome }) {
  return (
    <div className="mb-0">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-1.5 py-0 font-bold text-center mb-0 text-[10px]">
        DADOS DA OBRA
      </div>
      <div className="grid grid-cols-4 gap-x-2 gap-y-0 mb-0 text-[9px] leading-tight p-2">
        <div>
          <p className="font-bold text-gray-700">CLIENTE</p>
          <p className="text-gray-900">{regional?.cliente || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">OBRA</p>
          <p className="text-gray-900">{obra?.name || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">CAMADA</p>
          <p className="text-gray-900">{ensaio.camada || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">RODOVIA</p>
          <p className="text-gray-900">{ensaio.rodovia || '-'}</p>
        </div>
        {ensaio.empreiteira && (
          <div>
            <p className="font-bold text-gray-700">EMPREITEIRA</p>
            <p className="text-gray-900">{ensaio.empreiteira}</p>
          </div>
        )}
        <div>
          <p className="font-bold text-gray-700">MATERIAL</p>
          <p className="text-gray-900">{ensaio.material || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">LABORATORISTA</p>
          <p className="text-gray-900">{ensaio.laboratorista_name || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">CTE. VIGA</p>
          <p className="text-gray-900">{ensaio.cte_viga ? parseFloat(ensaio.cte_viga).toFixed(4) : '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">TRECHO</p>
          <p className="text-gray-900">{ensaio.trecho || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">PROCEDÊNCIA</p>
          <p className="text-gray-900">{ensaio.procedencia || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">PISTA/FAIXA</p>
          <p className="text-gray-900">{faixaNome || '-'}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">DEF. ADMISSÍVEL</p>
          <p className="text-gray-900">{ensaio.def_admissivel || '-'}</p>
        </div>
      </div>
    </div>
  );
}