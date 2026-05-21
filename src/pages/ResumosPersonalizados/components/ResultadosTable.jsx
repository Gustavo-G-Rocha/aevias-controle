import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, FileSpreadsheet } from "lucide-react";
import { formatValue } from "../utils/resumosUtils";

export default function ResultadosTable({
  dadosConsolidados, tipoEnsaioSelecionado, obraSelecionada,
  onExportarMedicaoGeometrica,
}) {
  if (dadosConsolidados.length === 0) return null;

  const colunas = Object.keys(dadosConsolidados[0]).filter(k => k !== 'tipo' && k !== 'data' && k !== 'id');

  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#00233B]">
            Resultados - {dadosConsolidados.length} registro(s)
          </CardTitle>
          {obraSelecionada && (
            <Badge className="bg-[#566E3D] text-white">{obraSelecionada.name}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#00233B] text-white">
                <th className="border border-white/20 px-2 py-2 text-left">Tipo</th>
                <th className="border border-white/20 px-2 py-2 text-left">Data</th>
                {tipoEnsaioSelecionado === 'ChecklistAplicacao' && (
                  <th className="border border-white/20 px-2 py-2 text-center">Medição Geométrica</th>
                )}
                {colunas.map(key => (
                  <th key={key} className="border border-white/20 px-2 py-2 text-left">
                    {key.replace('granulometria.', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosConsolidados.map((linha, idx) => (
                <tr key={linha.id ?? `linha-${idx}`} className={idx % 2 === 0 ? 'bg-white/50' : 'bg-white/30'}>
                  <td className="border border-white/20 px-2 py-2 font-medium text-[#00233B]">{linha.tipo}</td>
                  <td className="border border-white/20 px-2 py-2 text-[#00233B]">{formatValue(linha.data, 'data')}</td>
                  {tipoEnsaioSelecionado === 'ChecklistAplicacao' && (
                    <td className="border border-white/20 px-2 py-2 text-center">
                      <Button
                        size="sm" variant="outline"
                        onClick={() => onExportarMedicaoGeometrica(linha.id)}
                        className="h-7 text-xs border-[#00233B]/30 text-[#00233B] hover:bg-[#00233B]/10 gap-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        Excel
                      </Button>
                    </td>
                  )}
                  {colunas.map(key => (
                    <td key={key} className="border border-white/20 px-2 py-2 text-[#00233B]">{linha[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ tipoEnsaioSelecionado, obraId }) {
  if (!tipoEnsaioSelecionado || !obraId) return null;
  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-[#00233B]/10 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-[#00233B]/50" />
        </div>
        <p className="text-[#00233B]/80 text-center">
          Clique em "Gerar Resumo" para visualizar os dados
        </p>
      </CardContent>
    </Card>
  );
}