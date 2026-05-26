/**
 * Tabela de Não Conformidades reutilizável para páginas de relatório.
 * Aparece idêntica em: RelatorioChecklist, RelatorioChecklistAplicacao,
 * RelatorioChecklistMRAF, RelatorioChecklistTerraplanagem, RelatorioChecklistConcretagem.
 */
export default function ReportNaoConformidadesTable({ naoConformidades }) {
  if (!naoConformidades || naoConformidades.length === 0) return null;
  return (
    <table className="w-full border-collapse border border-slate-300 text-sm">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">LOCAL</th>
          <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">CATEGORIA</th>
          <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">PARÂMETRO</th>
        </tr>
      </thead>
      <tbody>
        {naoConformidades.map((nc, index) => (
          <tr key={`nc-${nc.parametro_nc ?? index}`} className="bg-white">
            <td className="border border-slate-300 px-3 py-2 text-slate-800">{nc.local_nc || 'N/A'}</td>
            <td className="border border-slate-300 px-3 py-2 text-slate-800">{nc.categoria_nc || 'N/A'}</td>
            <td className="border border-slate-300 px-3 py-2 text-slate-800">{nc.parametro_nc || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}