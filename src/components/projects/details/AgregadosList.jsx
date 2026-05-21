/**
 * AgregadosList.jsx
 * Tabela dos agregados do projeto com granulometria.
 */
import { PENEIRAS_ORDENADAS } from "@/constants/sieves";

export default function AgregadosList({ agregados }) {
  if (!agregados?.length) return null;

  return (
    <div className="space-y-4">
      {agregados.map((agr, i) => (
        <div key={i} className="p-4 bg-[#F2F1EF] rounded-lg border border-[#00233B]/10">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-[#00233B]">{agr.nome || `Agregado ${i + 1}`}</h4>
            {agr.percentual_mistura !== undefined && agr.percentual_mistura !== null && (
              <span className="text-sm font-bold text-[#00233B] bg-[#BFCF99]/40 px-2 py-0.5 rounded">
                {agr.percentual_mistura}%
              </span>
            )}
          </div>
          {agr.pedreira && (
            <p className="text-sm text-[#00233B]/70 mb-3">Pedreira: {agr.pedreira}</p>
          )}
          {agr.granulometria && Object.keys(agr.granulometria).length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#00233B]/10">
                    <th className="text-left p-1.5 text-[#00233B]">Peneira</th>
                    <th className="text-right p-1.5 text-[#00233B]">% Passante</th>
                  </tr>
                </thead>
                <tbody>
                  {PENEIRAS_ORDENADAS.filter(p => agr.granulometria[p.key] !== undefined && agr.granulometria[p.key] !== null).map(p => (
                    <tr key={p.key} className="border-b border-[#00233B]/10">
                      <td className="p-1.5 text-[#00233B]/80">{p.astm} ({p.abertura})</td>
                      <td className="p-1.5 text-right text-[#00233B] font-medium">{agr.granulometria[p.key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}