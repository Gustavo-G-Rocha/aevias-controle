/**
 * Seção de ensaios (Umidade, EA, Pulverulentos).
 */
import React from 'react';

export default function GranuMisturaEnsaios({ record }) {
  return (
    <div className="space-y-2">
      {/* Umidade */}
      <div className="border border-slate-400">
        <div className="bg-slate-100 px-2 py-0.5 font-bold text-[9px] text-center">
          DETERMINAÇÃO DE UMIDADE
        </div>
        <table className="w-full text-[9px]">
          <tbody>
            {[
              ['Peso Úmido (P₁)', record.umidade?.peso_umido, 'g'],
              ['Peso Seco (P₂)', record.umidade?.peso_seco, 'g'],
              ['Peso Água (P₁−P₂)', record.umidade?.peso_agua, 'g'],
              ['Umidade U=(Pω/P₂)×100', record.umidade?.umidade_pct, '%'],
            ].map(([label, val, unit]) => (
              <tr key={label}>
                <td className="px-2 py-0.5 text-gray-700">{label}</td>
                <td className="px-2 py-0.5 font-semibold text-center">
                  {val || '—'}
                </td>
                <td className="px-2 py-0.5 text-gray-500 text-right">{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equivalente de Areia */}
      <div className="border border-slate-400">
        <div className="bg-slate-100 px-2 py-0.5 font-bold text-[9px] text-center">
          EQUIVALENTE DE AREIA
        </div>
        <table className="w-full text-[9px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-300 px-2 py-0.5"></th>
              {(record.equivalente_areia?.medicoes || []).map((m, idx) => (
                <th
                  key={idx}
                  className="border-b border-slate-300 px-2 py-0.5 text-center"
                >
                  M{idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-0.5 font-semibold text-gray-700">
                T. Argila
              </td>
              {(record.equivalente_areia?.medicoes || []).map((m, idx) => (
                <td key={idx} className="px-2 py-0.5 text-center">
                  {m.topo_argila || '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-2 py-0.5 font-semibold text-gray-700">
                T. Areia
              </td>
              {(record.equivalente_areia?.medicoes || []).map((m, idx) => (
                <td key={idx} className="px-2 py-0.5 text-center">
                  {m.topo_areia || '—'}
                </td>
              ))}
            </tr>
            <tr className="bg-slate-50">
              <td className="px-2 py-0.5 font-semibold text-gray-700">
                EA (%)
              </td>
              {(record.equivalente_areia?.medicoes || []).map((m, idx) => (
                <td
                  key={idx}
                  className="px-2 py-0.5 text-center font-bold text-blue-800"
                >
                  {m.equivalente || '—'}
                </td>
              ))}
            </tr>
            <tr className="bg-slate-100 font-bold">
              <td className="px-2 py-0.5">MÉDIA</td>
              <td
                colSpan={record.equivalente_areia?.medicoes?.length || 1}
                className="px-2 py-0.5 text-center text-blue-900"
              >
                {record.equivalente_areia?.media || '—'}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Materiais Pulverulentos */}
      <div className="border border-slate-400">
        <div className="bg-slate-100 px-2 py-0.5 font-bold text-[9px] text-center">
          MATERIAIS PULVERULENTOS
        </div>
        <table className="w-full text-[9px]">
          <tbody>
            {[
              ['Peso Inicial (Pᵢ)', record.materiais_pulverulentos?.peso_inicial, 'g'],
              [
                'Peso Após Lavagem (Pf)',
                record.materiais_pulverulentos?.peso_apos_lavagem,
                'g',
              ],
              ['Teor ((Pi−Pf)/Pi×100)', record.materiais_pulverulentos?.teor_pct, '%'],
            ].map(([label, val, unit]) => (
              <tr key={label}>
                <td className="px-2 py-0.5 text-gray-700">{label}</td>
                <td className="px-2 py-0.5 font-semibold text-center">
                  {val || '—'}
                </td>
                <td className="px-2 py-0.5 text-gray-500 text-right">{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}