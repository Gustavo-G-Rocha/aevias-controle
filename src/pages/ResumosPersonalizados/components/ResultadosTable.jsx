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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-foreground">
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
                <tr key={linha.id ?? `linha-${idx}`} className={idx % 2 === 0 ? 'bg-muted/40' : 'bg-transparent'}>
                  <td className="border border-border px-2 py-2 font-medium text-foreground">{linha.tipo}</td>
                  <td className="border border-border px-2 py-2 text-foreground">{formatValue(linha.data, 'data')}</td>
                  {tipoEnsaioSelecionado === 'ChecklistAplicacao' && (
                    <td className="border border-border px-2 py-2 text-center">
                      <Button
                        size="sm" variant="outline"
                        onClick={() => onExportarMedicaoGeometrica(linha.id)}
                        className="h-7 text-xs gap-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        Excel
                      </Button>
                    </td>
                  )}
                  {colunas.map(key => (
                    <td key={key} className="border border-border px-2 py-2 text-foreground">{linha[key]}</td>
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
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">
          Clique em "Gerar Resumo" para visualizar os dados
        </p>
      </CardContent>
    </Card>
  );
}