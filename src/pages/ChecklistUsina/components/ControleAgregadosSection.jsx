import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export default function ControleAgregadosSection({
  formData,
  isEditable,
  isApproved,
  onAgregadoChange,
  onEquivalenteAreiaStatusChange,
  onEquivalenteAreiaAddResultado,
  onEquivalenteAreiaRemoveResultado,
  onEquivalenteAreiaResultadoChange,
  onObservacoesChange,
}) {
  const canEdit = isEditable && !isApproved;

  const handleStatusToggle = useCallback((status) => {
    if (formData.equivalente_areia_status === status) {
      onEquivalenteAreiaStatusChange(null, status === 'realizado');
    } else {
      onEquivalenteAreiaStatusChange(status, status === 'nao_realizado');
    }
  }, [formData.equivalente_areia_status, onEquivalenteAreiaStatusChange]);

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg">Controle de Agregados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-2 py-2 text-sm font-medium text-left">Agregado</th>
                <th className="border border-slate-300 px-2 py-2 text-sm font-medium text-center">Estoque Coberto?</th>
                <th className="border border-slate-300 px-2 py-2 text-sm font-medium text-center">Material Homogeneizado?</th>
                <th className="border border-slate-300 px-2 py-2 text-sm font-medium text-center">Granulometria Individual?</th>
                <th className="border border-slate-300 px-2 py-2 text-sm font-medium text-center">Qtde Granulometria</th>
              </tr>
            </thead>
            <tbody>
              {formData.controle_agregados.length > 0 ? formData.controle_agregados.map((agregado, index) => (
                <tr key={index}>
                  <td className="border border-slate-300 px-2 py-2 font-medium bg-muted/30">{agregado.nome}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <input type="checkbox" checked={agregado.estoque_coberto}
                      onChange={(e) => onAgregadoChange(index, 'estoque_coberto', e.target.checked)}
                      disabled={!canEdit} className="w-4 h-4" />
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <input type="checkbox" checked={agregado.material_homogeneizado}
                      onChange={(e) => onAgregadoChange(index, 'material_homogeneizado', e.target.checked)}
                      disabled={!canEdit} className="w-4 h-4" />
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <input type="checkbox" checked={agregado.granulometria_individual}
                      onChange={(e) => onAgregadoChange(index, 'granulometria_individual', e.target.checked)}
                      disabled={!canEdit} className="w-4 h-4" />
                  </td>
                  <td className="border border-slate-300 px-1 py-1 w-28">
                    <Input type="number" min="0"
                      value={agregado.granulometria_individual_qtde || ''}
                      onChange={(e) => onAgregadoChange(index, 'granulometria_individual_qtde', e.target.value ? parseInt(e.target.value) : 0)}
                      disabled={!canEdit} className="h-8 text-sm" placeholder="Qtde" />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-slate-500 italic">
                    {formData.project_id ? 'Nenhum agregado cadastrado neste projeto.' : 'Selecione um projeto para carregar os agregados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Equivalente de Areia */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Equivalente de Areia Realizado?</Label>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="equivalente_areia_sim"
                  checked={formData.equivalente_areia_status === 'realizado'}
                  onChange={() => handleStatusToggle('realizado')}
                  disabled={!canEdit} className="w-4 h-4" />
                <Label htmlFor="equivalente_areia_sim" className="text-sm font-normal">Sim</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="equivalente_areia_nao"
                  checked={formData.equivalente_areia_status === 'nao_realizado'}
                  onChange={() => handleStatusToggle('nao_realizado')}
                  disabled={!canEdit} className="w-4 h-4" />
                <Label htmlFor="equivalente_areia_nao" className="text-sm font-normal">Não</Label>
              </div>
            </div>

            {formData.equivalente_areia_status === 'realizado' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Resultados dos Ensaios (%)</Label>
                  {(formData.equivalente_areia_resultados?.length || 0) < 3 && canEdit && (
                    <Button type="button" size="sm" variant="outline" onClick={onEquivalenteAreiaAddResultado} className="h-8">
                      <Plus className="w-4 h-4 mr-1" /> Adicionar Ensaio
                    </Button>
                  )}
                </div>
                {formData.equivalente_areia_resultados?.length > 0 ? (
                  <div className="space-y-2">
                    {formData.equivalente_areia_resultados.map((resultado, index) => (
                      <div key={`ea-${index}`} className="flex items-center gap-2">
                        <Label className="text-xs text-slate-600 w-20 shrink-0">Ensaio {index + 1}:</Label>
                        <Input type="number" step="0.1" min="0" max="100"
                          value={resultado ?? ''}
                          onChange={(e) => onEquivalenteAreiaResultadoChange(index, e.target.value)}
                          disabled={!canEdit} placeholder={`Resultado ${index + 1}`} className="flex-1" />
                        {canEdit && (
                          <Button type="button" size="sm" variant="ghost"
                            onClick={() => onEquivalenteAreiaRemoveResultado(index)}
                            className="h-9 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Clique em "Adicionar Ensaio" para registrar os resultados (máximo 3)</p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="obs_agregados">Observações dos Agregados</Label>
            <Textarea id="obs_agregados" value={formData.observacoes_agregados}
              onChange={(e) => onObservacoesChange(e.target.value)}
              disabled={!canEdit} rows={2} maxLength="500" />
            <p className="text-xs text-right text-slate-500 mt-1">{formData.observacoes_agregados?.length || 0} / 500</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}