import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, FileSpreadsheet } from "lucide-react";
import { formatValue } from "../utils/resumosUtils";

export default function ResultadosTable({
  dadosConsolidados, tipoEnsaioSelecionado, obraSelecionada,
  onExportarMedicaoGeometrica, onExportarVigaBenkelman,
}) {
  if (dadosConsolidados.length === 0) return null;

  const colunas = Object.keys(dadosConsolidados[0]).filter(k => k !== 'tipo' && k !== 'data' && k !== 'id');

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader className="border-b border-border bg-surface-muted">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-foreground text-lg">
            Resultados · {dadosConsolidados.length} registro(s)
          </CardTitle>
          {obraSelecionada && (
            <Badge
              className="text-white font-medium"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              {obraSelecionada.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-primary)' }}>
                <th className="px-3 py-2.5 text-left font-semibold text-white whitespace-nowrap">
                  Tipo
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-white whitespace-nowrap">
                  Data
                </th>
                {(tipoEnsaioSelecionado === 'ChecklistAplicacao' || tipoEnsaioSelecionado === 'EnsaioVigaBenkelman') && (
                  <th className="px-3 py-2.5 text-center font-semibold text-white whitespace-nowrap">
                    Excel
                  </th>
                )}
                {colunas.map(key => (
                  <th key={key} className="px-3 py-2.5 text-left font-semibold text-white whitespace-nowrap">
                    {key.replace('granulometria.', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosConsolidados.map((linha, idx) => (
                <tr
                  key={linha.id ?? `linha-${idx}`}
                  className="border-b border-border transition-colors hover:bg-surface-muted"
                  style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-muted)' }}
                >
                  <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">
                    {linha.tipo}
                  </td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">
                    {formatValue(linha.data, 'data')}
                  </td>
                  {tipoEnsaioSelecionado === 'ChecklistAplicacao' && (
                    <td className="px-3 py-2 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onExportarMedicaoGeometrica(linha.id)}
                        className="h-7 text-xs gap-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        Excel
                      </Button>
                    </td>
                  )}
                  {tipoEnsaioSelecionado === 'EnsaioVigaBenkelman' && (
                    <td className="px-3 py-2 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onExportarVigaBenkelman(linha.id)}
                        className="h-7 text-xs gap-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        Excel
                      </Button>
                    </td>
                  )}
                  {colunas.map(key => (
                    <td key={key} className="px-3 py-2 text-foreground whitespace-nowrap">
                      {linha[key]}
                    </td>
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