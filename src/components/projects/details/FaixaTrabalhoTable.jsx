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
          <tr className="bg-muted/10">
            <th className="text-left p-2 text-foreground">Peneira</th>
            <th className="text-right p-2 text-foreground">Mín (%)</th>
            <th className="text-right p-2 text-foreground">Mistura (%)</th>
            <th className="text-right p-2 text-foreground">Máx (%)</th>
          </tr>
        </thead>
        <tbody>
          {peneirasComDados.map(p => (
            <tr key={p.key} className="border-b border-border/10">
              <td className="p-2 text-foreground/80">{p.astm} ({p.abertura})</td>
              <td className="p-2 text-right text-foreground">{faixaMin?.[p.key] ?? '—'}</td>
              <td className="p-2 text-right text-foreground font-semibold">{faixaTrabalho?.[p.key] ?? '—'}</td>
              <td className="p-2 text-right text-foreground">{faixaMax?.[p.key] ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}