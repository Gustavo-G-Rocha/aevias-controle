/**
 * PinturaLigacaoSection.jsx — ChecklistAplicacao
 *
 * Seção de acompanhamento da pintura de ligação.
 * Tabela com 5 linhas: barra espargidora, rompimento/cura,
 * taxa de pintura, resíduo da emulsão, taxa residual.
 * Cada linha tem campos de realizado, resultado e conformidade.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Converte boolean/null para string de Select e vice-versa */
const boolToStr = (v) => v === true ? "sim" : v === false ? "nao" : "";
const strToBool = (v) => v === "sim" ? true : v === "nao" ? false : null;

/** Select simples Sim/Não */
function SimNaoSelect({ value, onChange, disabled }) {
  return (
    <Select value={boolToStr(value)} onValueChange={(v) => onChange(strToBool(v))} disabled={disabled}>
      <SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="sim">Sim</SelectItem>
        <SelectItem value="nao">Não</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function PinturaLigacaoSection({ pintura, isEditable, onDeepChange, onNestedChange }) {
  const canEdit = isEditable;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Acompanhamento da Pintura de Ligação</h3>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm min-w-[600px]">
            <thead className="bg-muted/30">
              <tr>
                <th className="border border-border px-2 py-2 text-left">Serviço</th>
                <th className="border border-border px-2 py-2 text-center">Realizado</th>
                <th className="border border-border px-2 py-2 text-center">Resultado</th>
                <th className="border border-border px-2 py-2 text-center">Conformidade</th>
              </tr>
            </thead>
            <tbody>
              {/* Barra espargidora */}
              <tr>
                <td className="border border-border px-2 py-2">Pintura na barra espargidora</td>
                <td className="border border-border px-2 py-1">
                  <SimNaoSelect value={pintura.pintura_barra_espargidora.realizado}
                    onChange={(v) => onDeepChange('pintura_ligacao', 'pintura_barra_espargidora', 'realizado', v)}
                    disabled={!canEdit} />
                </td>
                <td className="border border-border px-2 py-1 text-center"><span className="text-xs">-</span></td>
                <td className="border border-border px-2 py-2 text-center text-xs">N/A</td>
              </tr>

              {/* Rompimento/cura */}
              <tr>
                <td className="border border-border px-2 py-2">Aguardado tempo para rompimento/cura</td>
                <td className="border border-border px-2 py-1">
                  <SimNaoSelect value={pintura.tempo_rompimento_cura.realizado}
                    onChange={(v) => onDeepChange('pintura_ligacao', 'tempo_rompimento_cura', 'realizado', v)}
                    disabled={!canEdit} />
                </td>
                <td className="border border-border px-2 py-1 text-center"><span className="text-xs">-</span></td>
                <td className="border border-border px-2 py-2 text-center text-xs">N/A</td>
              </tr>

              {/* Taxa de pintura */}
              <tr>
                <td className="border border-border px-2 py-2">Taxa de Pintura (l/m²)</td>
                <td className="border border-border px-2 py-1 text-center">
                  <input type="checkbox" checked={pintura.taxa_pintura.realizado}
                    onChange={(e) => onDeepChange('pintura_ligacao', 'taxa_pintura', 'realizado', e.target.checked)}
                    disabled={!canEdit} className="w-4 h-4" />
                </td>
                <td className="border border-border px-2 py-1">
                  <Input type="text" inputMode="decimal"
                    value={pintura.taxa_pintura.resultado ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                        onDeepChange('pintura_ligacao', 'taxa_pintura', 'resultado', val === '' ? null : parseFloat(val) || val);
                      }
                    }}
                    disabled={!canEdit || !pintura.taxa_pintura.realizado}
                    placeholder="Ex: 0.9" className="h-8" />
                </td>
                <td className="border border-border px-2 py-1">
                  <SimNaoSelect value={pintura.taxa_pintura.conforme}
                    onChange={(v) => onDeepChange('pintura_ligacao', 'taxa_pintura', 'conforme', v)}
                    disabled={!canEdit || !pintura.taxa_pintura.realizado} />
                </td>
              </tr>

              {/* Resíduo emulsão */}
              <tr>
                <td className="border border-border px-2 py-2">Resíduo da Emulsão (%)</td>
                <td className="border border-border px-2 py-1 text-center">
                  <input type="checkbox" checked={pintura.residuo_emulsao.realizado}
                    onChange={(e) => onDeepChange('pintura_ligacao', 'residuo_emulsao', 'realizado', e.target.checked)}
                    disabled={!canEdit} className="w-4 h-4" />
                </td>
                <td className="border border-border px-2 py-1">
                  <Input type="number" step="0.1" value={pintura.residuo_emulsao.resultado || ''}
                    onChange={(e) => onDeepChange('pintura_ligacao', 'residuo_emulsao', 'resultado', e.target.value ? parseFloat(e.target.value) : null)}
                    disabled={!canEdit} placeholder="Ex: 60" className="h-8" />
                </td>
                <td className="border border-border px-2 py-2 text-center text-xs">-</td>
              </tr>

              {/* Taxa residual */}
              <tr>
                <td className="border border-border px-2 py-2">Taxa de Pintura Residual (l/m²)</td>
                <td className="border border-border px-2 py-1 text-center">
                  <input type="checkbox" checked={pintura.taxa_pintura_residual.realizado}
                    onChange={(e) => onDeepChange('pintura_ligacao', 'taxa_pintura_residual', 'realizado', e.target.checked)}
                    disabled={!canEdit} className="w-4 h-4" />
                </td>
                <td className="border border-border px-2 py-1">
                  <Input type="text" inputMode="decimal"
                    value={pintura.taxa_pintura_residual.resultado ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                        onDeepChange('pintura_ligacao', 'taxa_pintura_residual', 'resultado', val === '' ? null : parseFloat(val) || val);
                      }
                    }}
                    disabled={!canEdit || !pintura.taxa_pintura_residual.realizado}
                    placeholder="Ex: 0.35" className="h-8" />
                </td>
                <td className="border border-border px-2 py-1">
                  <SimNaoSelect value={pintura.taxa_pintura_residual.conforme}
                    onChange={(v) => onDeepChange('pintura_ligacao', 'taxa_pintura_residual', 'conforme', v)}
                    disabled={!canEdit || !pintura.taxa_pintura_residual.realizado} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea value={pintura.observacoes || ''}
            onChange={(e) => onNestedChange('pintura_ligacao', 'observacoes', e.target.value)}
            disabled={!canEdit} rows={2} maxLength={500}
            placeholder="Observações sobre a pintura de ligação..." />
          <p className="text-xs text-right text-muted-foreground mt-1">
            {(pintura.observacoes || '').length} / 500 caracteres
          </p>
        </div>
      </div>
    </div>
  );
}