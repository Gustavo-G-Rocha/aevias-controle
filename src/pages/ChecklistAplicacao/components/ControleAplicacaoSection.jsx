/**
 * ControleAplicacaoSection.jsx — ChecklistAplicacao
 *
 * Seção de controle de aplicação do Checklist de Aplicação.
 * Inclui:
 *   - campos de km/estaca inicial/final e lados
 *   - quantidades aplicadas (cargas e toneladas)
 *   - tabela de ensaios (temperatura de aplicação, espessura de camada)
 *   - campo de observações
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ControleAplicacaoSection({ controle, isEditable, onNestedChange, onDeepChange }) {
  const canEdit = isEditable;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Controle de Aplicação</h3>
      <div className="space-y-4">

        {/* Km/estaca e quantidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <Label>Km/Estaca Inicial</Label>
            <Input value={controle.km_estaca_inicial}
              onChange={(e) => onNestedChange('controle_aplicacao', 'km_estaca_inicial', e.target.value)}
              disabled={!canEdit} placeholder="Ex: km 10+500" />
          </div>
          <div>
            <Label>Lado Inicial</Label>
            <Select value={controle.lado_inicial}
              onValueChange={(v) => onNestedChange('controle_aplicacao', 'lado_inicial', v)}
              disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="direito">Direito</SelectItem>
                <SelectItem value="esquerdo">Esquerdo</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Km/Estaca Final</Label>
            <Input value={controle.km_estaca_final}
              onChange={(e) => onNestedChange('controle_aplicacao', 'km_estaca_final', e.target.value)}
              disabled={!canEdit} placeholder="Ex: km 12+300" />
          </div>
          <div>
            <Label>Lado Final</Label>
            <Select value={controle.lado_final}
              onValueChange={(v) => onNestedChange('controle_aplicacao', 'lado_final', v)}
              disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="direito">Direito</SelectItem>
                <SelectItem value="esquerdo">Esquerdo</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantidade Aplicada (cargas)</Label>
            <Input type="number" value={controle.quantidade_aplicada_cargas || ''}
              onChange={(e) => onNestedChange('controle_aplicacao', 'quantidade_aplicada_cargas', e.target.value ? parseInt(e.target.value) : null)}
              disabled={!canEdit} placeholder="Ex: 15" />
          </div>
          <div>
            <Label>Quantidade Aplicada (t)</Label>
            <Input type="number" step="0.01" value={controle.quantidade_aplicada_toneladas || ''}
              onChange={(e) => onNestedChange('controle_aplicacao', 'quantidade_aplicada_toneladas', e.target.value ? parseFloat(e.target.value) : null)}
              disabled={!canEdit} placeholder="Ex: 150.5" />
          </div>
        </div>

        {/* Tabela de ensaios */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-sm min-w-[700px]">
            <thead className="bg-muted/30">
              <tr>
                <th className="border border-slate-300 px-2 py-2 text-left">Ensaio</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Realizado</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Qtde</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Frequência</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Limite</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Conforme</th>
              </tr>
            </thead>
            <tbody>
              {/* Temperatura de aplicação */}
              <tr>
                <td className="border border-slate-300 px-2 py-2">Temperatura de aplicação das cargas (°C)</td>
                <td className="border border-slate-300 px-2 py-1 text-center">
                  <input type="checkbox" checked={controle.temp_aplicacao_cargas.realizado}
                    onChange={(e) => onDeepChange('controle_aplicacao', 'temp_aplicacao_cargas', 'realizado', e.target.checked)}
                    disabled={!canEdit} className="w-4 h-4" />
                </td>
                <td className="border border-slate-300 px-2 py-1">
                  <Input type="number" min="0"
                    value={controle.temp_aplicacao_cargas.quantidade || ''}
                    onChange={(e) => onDeepChange('controle_aplicacao', 'temp_aplicacao_cargas', 'quantidade', e.target.value ? parseInt(e.target.value) : 0)}
                    disabled={!canEdit} className="h-8 text-sm" />
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center text-xs">2 por carga</td>
                <td className="border border-slate-300 px-2 py-2 text-center text-xs">Estabelecida em projeto</td>
                <td className="border border-slate-300 px-2 py-1 text-center">
                  <input type="checkbox" checked={controle.temp_aplicacao_cargas.conforme || false}
                    onChange={(e) => onDeepChange('controle_aplicacao', 'temp_aplicacao_cargas', 'conforme', e.target.checked)}
                    disabled={!canEdit} className="w-4 h-4" />
                </td>
              </tr>

              {/* Espessura da camada */}
              <tr>
                <td className="border border-slate-300 px-2 py-2">Espessura da camada (cm)</td>
                <td className="border border-slate-300 px-2 py-1 text-center">
                  <input type="checkbox" checked={controle.espessura_camada.realizado}
                    onChange={(e) => onDeepChange('controle_aplicacao', 'espessura_camada', 'realizado', e.target.checked)}
                    disabled={!canEdit} className="w-4 h-4" />
                </td>
                <td className="border border-slate-300 px-2 py-1">
                  <Input type="number" min="0"
                    value={controle.espessura_camada.quantidade || ''}
                    onChange={(e) => onDeepChange('controle_aplicacao', 'espessura_camada', 'quantidade', e.target.value ? parseInt(e.target.value) : 0)}
                    disabled={!canEdit} className="h-8 text-sm" />
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center text-xs">Para cada carga aplicada</td>
                <td className="border border-slate-300 px-2 py-2 text-center text-xs">Estabelecida em projeto</td>
                <td className="border border-slate-300 px-2 py-1 text-center">
                  <input type="checkbox" checked={controle.espessura_camada.conforme || false}
                    onChange={(e) => onDeepChange('controle_aplicacao', 'espessura_camada', 'conforme', e.target.checked)}
                    disabled={!canEdit} className="w-4 h-4" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea value={controle.observacoes || ''}
            onChange={(e) => onNestedChange('controle_aplicacao', 'observacoes', e.target.value)}
            disabled={!canEdit} rows={2} maxLength={500}
            placeholder="Observações sobre o controle de aplicação..." />
          <p className="text-xs text-right text-muted-foreground mt-1">
            {(controle.observacoes || '').length} / 500 caracteres
          </p>
        </div>
      </div>
    </div>
  );
}