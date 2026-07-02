/**
 * FaixaEspecificacaoTable.jsx
 * Tabela de faixa de especificação granulométrica (min/max).
 */
export default function FaixaEspecificacaoTable({ faixaEspecificacao }) {
  if (!faixaEspecificacao?.peneiras?.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/10">
            <th className="text-left p-2 text-foreground">Peneira</th>
            <th className="text-right p-2 text-foreground">Abertura (mm)</th>
            <th className="text-right p-2 text-foreground">Mín (%)</th>
            <th className="text-right p-2 text-foreground">Máx (%)</th>
          </tr>
        </thead>
        <tbody>
          {faixaEspecificacao.peneiras.map((p, i) => (
            <tr key={i} className="border-b border-border/10">
              <td className="p-2 text-foreground/80">{p.astm}</td>
              <td className="p-2 text-right text-foreground/80">{p.abertura}</td>
              <td className="p-2 text-right text-foreground font-medium">{p.min ?? '—'}</td>
              <td className="p-2 text-right text-foreground font-medium">{p.max ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}