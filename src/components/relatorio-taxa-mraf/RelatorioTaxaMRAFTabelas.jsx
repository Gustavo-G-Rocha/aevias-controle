import React from 'react';
import { formatValueByField, isTaxaNaoConforme } from '@/utils/relatorioTaxaMRAFUtils';

const DADOS_ENSAIO = [
  { label: 'Estaca do Ensaio', calc: '–', unit: '-', field: 'estaca' },
  { label: 'Posição', calc: '–', unit: '-', field: 'posicao' },
  { label: 'Peso da Bandeja+Amostra', calc: 'P₁', unit: 'g', field: 'peso_bandeja_amostra' },
  { label: 'Peso da Bandeja', calc: 'P₂', unit: 'g', field: 'peso_bandeja' },
  { label: 'Peso da Amostra', calc: 'Pₐ = P₁ − P₂', unit: 'g', field: 'peso_amostra' },
  { label: 'Taxa de MRAF Aplicada', calc: 'Tₓ = Pₐ/(1000×A)', unit: 'kg/m²', field: 'taxa_mraf_aplicada', media: true, media_field: 'media_taxa_mraf' },
  { label: 'Teor de Ligante', calc: 'L (ensaio extração)', unit: '%', field: 'teor_ligante' },
  { label: 'Taxa de Ligante', calc: 'T_L = (Tₓ×L)/(100+L)', unit: 'L/m²', field: 'taxa_ligante' },
  { label: 'Resíduo da Emulsão', calc: 'R', unit: '%', field: 'residuo_emulsao' },
  { label: 'Taxa de Emulsão', calc: 'T_E = T_L / R', unit: 'L/m²', field: 'taxa_emulsao', media: true, media_field: 'media_taxa_emulsao' },
  { label: 'Taxa de Agregado', calc: 'T_A = Tₓ − T_L', unit: 'kg/m²', field: 'taxa_agregado', media: true, media_field: 'media_taxa_agregado' },
];

export default function RelatorioTaxaMRAFTabelas({ ensaio }) {
  const taxaMinima = ensaio?.taxa_minima_projeto;
  const isRateFields = ['taxa_mraf_aplicada', 'taxa_ligante', 'taxa_emulsao', 'taxa_agregado'];

  return (
    <div className="mb-3">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-2 py-1 font-bold text-center mb-1 text-xs">DADOS DO ENSAIO</div>

      {/* Área da Bandeja */}
      <div className="bg-slate-200 px-2 py-1 font-bold text-center text-[9px]">ÁREA DA BANDEJA</div>
      <table className="w-full border-collapse border border-slate-300 text-xs mb-3">
        <thead style={{backgroundColor:'#e2e8f0'}}>
          <tr>
            <th className="border border-slate-300 px-2 py-1.5 text-left font-medium">Parâmetro</th>
            <th className="border border-slate-300 px-2 py-1.5 text-center font-medium">Unidade</th>
            {ensaio?.ensaios?.map((_, i) => (
              <th key={`bandeja-${i + 1}`} className="border border-slate-300 px-2 py-1.5 text-center font-medium">Bandeja {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-2 py-2 bg-white">Lado 1</td>
            <td className="border border-slate-300 px-2 py-2 text-center">cm</td>
            {ensaio?.ensaios?.map((_, i) => (
              <td key={i} className="border border-slate-300 px-2 py-2 text-center">{ensaio.dimensoes_bandeja?.lado_1 ?? '-'}</td>
            ))}
          </tr>
          <tr>
            <td className="border border-slate-300 px-2 py-2 bg-white">Lado 2</td>
            <td className="border border-slate-300 px-2 py-2 text-center">cm</td>
            {ensaio?.ensaios?.map((_, i) => (
              <td key={`lado2-${i}`} className="border border-slate-300 px-2 py-2 text-center">{ensaio.dimensoes_bandeja?.lado_2 ?? '-'}</td>
            ))}
          </tr>
          <tr>
            <td className="border border-slate-300 px-2 py-2 bg-white font-medium">Área</td>
            <td className="border border-slate-300 px-2 py-2 text-center">m²</td>
            {ensaio?.ensaios?.map((_, i) => (
              <td key={i} className="border border-slate-300 px-2 py-2 text-center font-bold">{ensaio.dimensoes_bandeja?.area?.toFixed(4) ?? '-'}</td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Execução do Ensaio */}
      <div className="bg-slate-200 px-2 py-1 font-bold text-center text-[9px]">EXECUÇÃO DO ENSAIO</div>
      <table className="w-full border-collapse border border-slate-300 text-xs mb-3">
        <thead style={{backgroundColor:'#e2e8f0'}}>
          <tr>
            <th className="border border-slate-300 px-2 py-1.5 text-left font-medium">Parâmetro</th>
            <th className="border border-slate-300 px-2 py-1.5 text-center font-medium">Unidade</th>
            {ensaio?.ensaios?.map((_, i) => (
              <th key={`exec-${i}`} className="border border-slate-300 px-2 py-1.5 text-center font-medium">Bandeja {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DADOS_ENSAIO.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="border border-slate-300 px-2 py-2 bg-white font-medium">{row.label}</td>
              <td className="border border-slate-300 px-2 py-2 text-center">{row.unit}</td>
              {ensaio?.ensaios?.map((e, i) => {
                const val = e[row.field];
                const isRateField = isRateFields.includes(row.field);
                const naoConforme = row.field === 'taxa_mraf_aplicada' && isTaxaNaoConforme(val, taxaMinima);
                return (
                  <td key={i} className={`border border-slate-300 px-2 py-2 text-center ${naoConforme ? 'bg-red-100 text-red-700 font-bold' : ''}`}>
                    {formatValueByField(val, row.field, isRateField)}
                    {naoConforme && <span className="block text-[9px] text-red-600">NC</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}