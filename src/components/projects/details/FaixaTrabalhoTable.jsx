/**
 * FaixaTrabalhoTable.jsx
 * Tabela de faixa de trabalho: mín / mistura (ótimo) / máx por peneira.
 */
import { PENEIRAS_ORDENADAS } from "@/constants/sieves";

export default function FaixaTrabalhoTable({ faixaTrabalho, faixaMin, faixaMax }) {
  const peneirasComDados = PENEIRAS_ORDENADAS.filter(p => {
    const temTrabalho = faixaTrabalho?.[p.key] !== undefined && faixaTrabalho?.[p.key] !== null;
    const temMin = faixaMin?.[p.key] !== undefined && faixaMin?.[p.key] !== null;
    const temMax = faixaMax?.[p.key] !== undefined && faixaMax?.[p.key] !== null;
    return temTrabalho || temMin || temMax;
  });

  if (!peneirasComDados.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#00233B]/10">
            <th className="text-left p-2 text-[#00233B]">Peneira</th>
            <th className="text-right p-2 text-[#00233B]">Mín (%)</th>
            <th className="text-right p-2 text-[#00233B]">Mistura (%)</th>
            <th className="text-right p-2 text-[#00233B]">Máx (%)</th>
          </tr>
        </thead>
        <tbody>
          {peneirasComDados.map(p => (
            <tr key={p.key} className="border-b border-[#00233B]/10">
              <td className="p-2 text-[#00233B]/80">{p.astm} ({p.abertura})</td>
              <td className="p-2 text-right text-[#00233B]">{faixaMin?.[p.key] ?? '—'}</td>
              <td className="p-2 text-right text-[#00233B] font-semibold">{faixaTrabalho?.[p.key] ?? '—'}</td>
              <td className="p-2 text-right text-[#00233B]">{faixaMax?.[p.key] ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}