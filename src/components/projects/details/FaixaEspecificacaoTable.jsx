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
          <tr className="bg-[#00233B]/10">
            <th className="text-left p-2 text-[#00233B]">Peneira</th>
            <th className="text-right p-2 text-[#00233B]">Abertura (mm)</th>
            <th className="text-right p-2 text-[#00233B]">Mín (%)</th>
            <th className="text-right p-2 text-[#00233B]">Máx (%)</th>
          </tr>
        </thead>
        <tbody>
          {faixaEspecificacao.peneiras.map((p, i) => (
            <tr key={i} className="border-b border-[#00233B]/10">
              <td className="p-2 text-[#00233B]/80">{p.astm}</td>
              <td className="p-2 text-right text-[#00233B]/80">{p.abertura}</td>
              <td className="p-2 text-right text-[#00233B] font-medium">{p.min ?? '—'}</td>
              <td className="p-2 text-right text-[#00233B] font-medium">{p.max ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}