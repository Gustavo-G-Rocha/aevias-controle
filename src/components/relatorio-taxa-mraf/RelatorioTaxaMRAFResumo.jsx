import React from 'react';
import { isTaxaNaoConforme, isTaxaConforme } from '@/utils/relatorioTaxaMRAFUtils';

const RESUMO_ITEMS = [
  { label: 'Taxa de Emulsão Média', field: 'media_taxa_emulsao', unit: 'L/m²', isMain: false },
  { label: 'Taxa de Agregado Média', field: 'media_taxa_agregado', unit: 'kg/m²', isMain: false },
  { label: 'Taxa MRAF Aplicada Média', field: 'media_taxa_mraf', unit: 'kg/m²', isMain: true },
];

export default function RelatorioTaxaMRAFResumo({ ensaio }) {
  const taxaMinima = ensaio?.taxa_minima_projeto;

  return (
    <div className="mb-3">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-2 py-1 font-bold text-center mb-1 text-xs">RESUMO — MÉDIAS GERAIS</div>
      <div className="grid grid-cols-3 border border-slate-300 text-xs">
        {RESUMO_ITEMS.map((item, idx) => {
          const val = ensaio?.[item.field];
          const naoConforme = item.isMain && isTaxaNaoConforme(val, taxaMinima);
          const conforme = item.isMain && isTaxaConforme(val, taxaMinima);
          return (
            <div key={idx} className={`py-1 px-1.5 text-center border-r last:border-r-0 border-slate-300 ${naoConforme ? 'bg-red-50' : ''}`}>
              <p className="text-[9px] font-semibold leading-tight" style={{color:'#2d3b4e'}}>{item.label}</p>
              <p className={`text-xs font-bold leading-tight ${naoConforme ? 'text-red-700' : ''}`} style={!naoConforme ? {color:'#2d3b4e'} : {}}>
                {val != null ? val.toFixed(1) : '-'}
              </p>
              <p className="text-[8px] text-slate-500">{item.unit}</p>
              {naoConforme && <p className="text-[8px] font-bold text-red-600">⚠ NC — mín: {taxaMinima} {item.unit}</p>}
              {conforme && <p className="text-[8px] font-bold text-green-700">✓ Conforme — mín: {taxaMinima} {item.unit}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}