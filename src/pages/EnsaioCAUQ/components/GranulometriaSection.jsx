/**
 * GranulometriaSection.jsx
 *
 * Seção de granulometria do Ensaio CAUQ.
 * Exibe a tabela de peneiras filtradas pela faixa do projeto selecionado.
 * Calcula % passante acumulado em tempo real.
 * Referência: DNIT 412/2025.
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GranulometriaSection({
  formData,
  peneirasDoProjecto,
  selectedProject,
  isEditable,
  isApproved,
  onNestedChange,
}) {
  const canEdit = isEditable && !isApproved;
  const pesoInicial = parseFloat(formData.extracao_ligante?.amostra_sem_ligante) || 0;

  const handleFillExample = () => {
    if (!canEdit || peneirasDoProjecto.length === 0) return;
    // Distribui valores decrescentes de exemplo entre as peneiras
    const total = peneirasDoProjecto.length;
    const newValues = {};
    peneirasDoProjecto.forEach((peneira, index) => {
      // Primeiras peneiras (maiores aberturas) retêm mais material
      const baseValue = (total - index) * (pesoInicial / (total * 3));
      newValues[peneira.key] = baseValue.toFixed(2);
    });
    onNestedChange('granulometria', 'peso_retido_peneiras', () => newValues);
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Granulometria *</CardTitle>
            <CardDescription>DNIT 412/2025</CardDescription>
          </div>
          {canEdit && peneirasDoProjecto.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillExample}
              data-testid="fill-sieves-example"
            >
              Preencher Exemplo
            </Button>
          )}
        </div>
        {pesoInicial > 0 && (
          <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded text-sm text-primary">
            <strong>Peso Inicial da Amostra (sem ligante):</strong> {pesoInicial} g
          </div>
        )}
        {!selectedProject && (
          <p className="text-sm text-amber-600 mt-2">
            ⚠️ Selecione um projeto para ver apenas as peneiras da faixa especificada
          </p>
        )}
      </CardHeader>
      <CardContent>
        {peneirasDoProjecto.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma peneira disponível. Selecione um projeto com faixa granulométrica configurada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-2 py-2 text-left">Peneira ASTM</th>
                  <th className="border border-border px-2 py-2 text-left">Abertura (mm)</th>
                  <th className="border border-border px-2 py-2 text-center">Retido (g)</th>
                  <th className="border border-border px-2 py-2 text-center">% Passante</th>
                </tr>
              </thead>
              <tbody>
                {peneirasDoProjecto.map((peneira, index) => {
                  let acumuladoRetido = 0;
                  for (let i = 0; i <= index; i++) {
                    const val = formData.granulometria.peso_retido_peneiras?.[peneirasDoProjecto[i].key];
                    acumuladoRetido += parseFloat(val) || 0;
                  }
                  const percentualPassante = pesoInicial > 0
                    ? ((pesoInicial - acumuladoRetido) / pesoInicial * 100).toFixed(1)
                    : '-';

                  return (
                    <tr key={peneira.key}>
                      <td className="border border-border px-2 py-2 font-medium">{peneira.label}</td>
                      <td className="border border-border px-2 py-2">{peneira.abertura}</td>
                      <td className="border border-border px-1 py-1">
                        <Input type="number" step="0.01"
                          aria-label={`Retido peneira ${peneira.label} (g)`}
                          data-testid={`sieve-input-${peneira.key}`}
                          value={formData.granulometria.peso_retido_peneiras?.[peneira.key] ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            onNestedChange('granulometria', 'peso_retido_peneiras', (prev) => ({
                              ...prev,
                              [peneira.key]: raw === '' ? null : raw,
                            }));
                          }}
                          disabled={!canEdit} className="h-8 text-sm" />
                      </td>
                      <td className="border border-border px-2 py-2 text-center font-semibold text-blue-600">
                        {percentualPassante}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}