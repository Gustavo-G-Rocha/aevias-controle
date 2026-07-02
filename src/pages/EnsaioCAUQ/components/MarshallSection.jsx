/**
 * MarshallSection.jsx
 *
 * Seção de Ensaio Marshall do Ensaio CAUQ.
 * Gerencia a lista de corpos de prova (CP) com dois métodos:
 *   - RTCD (diametral)
 *   - Estabilidade e Fluência
 *
 * Todos os cálculos derivados (volume, densidade, vazios, VCB, VAM, RBV,
 * RTCD, estabilidade corrigida, fluência) são executados pelo hook.
 * Referências: DNIT 428/22 — NBR 15087/12.
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

function CorpoProvaCard({ cp, index, isEditable, isApproved, onCorpoProvaChange, onRemover }) {
  const canEdit = isEditable && !isApproved;

  return (
    <Card className="relative border-2 border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Corpo de Prova {cp.numero}</CardTitle>
          {canEdit && (
            <Button type="button" variant="ghost" size="sm"
              onClick={() => onRemover(index)} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Método de rompimento */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Label className="font-semibold text-blue-900 mb-2 block">Método de Rompimento *</Label>
          <div className="flex gap-4">
            {[
              { value: 'diametral', label: 'RTCD (Diametral)' },
              { value: 'estabilidade_fluencia', label: 'Estabilidade e Fluência' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`metodo_${index}`} value={opt.value}
                  checked={cp.metodo_rompimento === opt.value}
                  onChange={(e) => onCorpoProvaChange(index, 'metodo_rompimento', e.target.value)}
                  disabled={!canEdit} className="w-4 h-4" />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dados volumétricos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Peso Ar (g)', field: 'peso_ar', step: '0.1', readOnly: false },
            { label: 'Peso Imerso (g)', field: 'peso_imerso', step: '0.1', readOnly: false },
            { label: 'Peso SSS (g)', field: 'peso_sss', step: '0.1', readOnly: false },
            { label: 'Volume (cm³)', field: 'volume', step: '0.01', readOnly: true },
            { label: 'Densidade Ap. (g/cm³)', field: 'densidade_aparente', step: '0.001', readOnly: true },
            { label: 'Volume Vazios (%)', field: 'volume_vazios', step: '0.1', readOnly: true },
            { label: 'V.C.B. (%)', field: 'vcb', step: '0.01', readOnly: true },
            { label: 'V.A.M. (%)', field: 'vam', step: '0.1', readOnly: true },
            { label: 'R.B.V. (%)', field: 'rbv', step: '0.01', readOnly: true },
            { label: 'Altura (cm)', field: 'altura', step: '0.01', readOnly: false },
            { label: 'Const. Prensa', field: 'const_prensa', step: '0.01', readOnly: false, defaultVal: 1.0 },
          ].map(({ label, field, step, readOnly, defaultVal }) => (
            <div key={field}>
              <Label className="text-xs">{label}</Label>
              <Input type="number" step={step}
                value={cp[field] ?? (defaultVal ?? '')}
                onChange={readOnly ? undefined : (e) => onCorpoProvaChange(index, field, e.target.value ? parseFloat(e.target.value) : (defaultVal ?? null))}
                readOnly={readOnly} disabled={!canEdit && !readOnly}
                className={`h-9 ${readOnly ? 'bg-slate-100' : ''}`} />
            </div>
          ))}
        </div>

        {/* RTCD */}
        {cp.metodo_rompimento === 'diametral' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Resistência à Tração por Compressão Diametral (RTCD)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Leitura (Kgf/cm²)</Label>
                <Input type="number" step="0.01" value={cp.rtcd_leitura || ''}
                  onChange={(e) => onCorpoProvaChange(index, 'rtcd_leitura', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">RTCD (MPa)</Label>
                <Input type="number" step="0.01" value={cp.rtcd_valor || ''}
                  readOnly className="bg-green-100 font-semibold h-9" />
              </div>
            </div>
          </div>
        )}

        {/* Estabilidade e fluência */}
        {cp.metodo_rompimento === 'estabilidade_fluencia' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-3">Estabilidade e Fluência</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Leitura (Kgf/cm²)</Label>
                <Input type="number" step="0.01" value={cp.estabilidade_leitura || ''}
                  onChange={(e) => onCorpoProvaChange(index, 'estabilidade_leitura', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Estabilidade Corrig. (Kgf/cm²)</Label>
                <Input type="number" step="0.1" value={cp.estabilidade_corrigida || ''}
                  readOnly className="bg-amber-100 font-semibold h-9" />
              </div>
              <div>
                <Label className="text-xs">Fluência Inicial (mm)</Label>
                <Input type="number" step="0.01" value={cp.fluencia_leitura_inicial || ''}
                  onChange={(e) => onCorpoProvaChange(index, 'fluencia_leitura_inicial', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Fluência Final (mm)</Label>
                <Input type="number" step="0.01" value={cp.fluencia_leitura_final || ''}
                  onChange={(e) => onCorpoProvaChange(index, 'fluencia_leitura_final', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Fluência (mm)</Label>
                <Input type="number" step="0.01" value={cp.fluencia || ''}
                  readOnly className="bg-amber-100 font-semibold h-9" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MarshallSection({
  formData,
  isEditable,
  isApproved,
  onChange,
  onCorpoProvaChange,
  onAdicionarCP,
  onRemoverCP,
}) {
  const canEdit = isEditable && !isApproved;

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Ensaio Marshall (Opcional)</CardTitle>
            <CardDescription>DNIT 428/22 - NBR 15087/12</CardDescription>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal">Realizar Marshall?</Label>
              <input type="checkbox" checked={formData.realizar_marshall}
                onChange={(e) => {
                  onChange('realizar_marshall', e.target.checked);
                  if (!e.target.checked) onChange('corpos_prova_marshall', []);
                }} className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!formData.realizar_marshall ? (
          <p className="text-center text-slate-500 py-8 italic">
            Marque a opção "Realizar Marshall?" para incluir o ensaio Marshall
          </p>
        ) : (
          <>
            {canEdit && formData.corpos_prova_marshall.length < 6 && (
              <div className="flex justify-end">
                <Button type="button" onClick={onAdicionarCP} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar CP Marshall
                </Button>
              </div>
            )}
            {formData.corpos_prova_marshall.length === 0 ? (
              <p className="text-center text-slate-500 py-4 italic">
                Clique em "Adicionar CP Marshall" para incluir corpos de prova ao ensaio
              </p>
            ) : (
              formData.corpos_prova_marshall.map((cp, index) => (
                <CorpoProvaCard key={index}
                  cp={cp} index={index}
                  isEditable={isEditable} isApproved={isApproved}
                  onCorpoProvaChange={onCorpoProvaChange}
                  onRemover={onRemoverCP} />
              ))
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}