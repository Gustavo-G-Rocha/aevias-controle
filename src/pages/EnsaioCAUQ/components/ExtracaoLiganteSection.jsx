/**
 * ExtracaoLiganteSection.jsx
 *
 * Seção de Extração de Ligante (Rotarex) do Ensaio CAUQ.
 * Exibe campos de entrada e campos calculados automaticamente pelo hook.
 * Referência: DNIT 427/20 — ABNT NBR 15619/16.
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExtracaoLiganteSection({ formData, isEditable, isApproved, onNestedChange, onChange }) {
  const canEdit = isEditable && !isApproved;

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Extração de Ligante (Rotarex) *</CardTitle>
            <CardDescription>DNIT 427/20 - ABNT NBR 15619/16</CardDescription>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal">Ensaio de Umidade?</Label>
              <input type="checkbox" checked={formData.realizar_ensaio_umidade}
                onChange={(e) => onChange('realizar_ensaio_umidade', e.target.checked)}
                className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Campos de umidade (condicionais) */}
          {formData.realizar_ensaio_umidade && (
            <>
              <div>
                <Label>Amostra Úmida (g)</Label>
                <Input type="number" step="0.01"
                  value={formData.extracao_ligante.amostra_umida || ''}
                  onChange={(e) => onNestedChange('extracao_ligante', 'amostra_umida', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Amostra Seca (g)</Label>
                <Input type="number" step="0.01"
                  value={formData.extracao_ligante.amostra_seca || ''}
                  onChange={(e) => onNestedChange('extracao_ligante', 'amostra_seca', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Umidade (%)</Label>
                <Input type="number" step="0.01"
                  value={formData.extracao_ligante.umidade || ''} readOnly className="bg-slate-100" />
              </div>
            </>
          )}

          {/* Campos principais */}
          <div>
            <Label>Amostra com Ligante (g){formData.status === 'finalizado' && ' *'}</Label>
            <Input type="number" step="0.01"
              value={formData.extracao_ligante.amostra_com_ligante || ''}
              onChange={(e) => onNestedChange('extracao_ligante', 'amostra_com_ligante', e.target.value ? parseFloat(e.target.value) : null)}
              disabled={!canEdit} required={formData.status === 'finalizado'} />
          </div>

          <div>
            <Label>Amostra sem Ligante (g){formData.status === 'finalizado' && ' *'}</Label>
            <Input type="number" step="0.01"
              value={formData.extracao_ligante.amostra_sem_ligante || ''}
              onChange={(e) => onNestedChange('extracao_ligante', 'amostra_sem_ligante', e.target.value ? parseFloat(e.target.value) : null)}
              disabled={!canEdit} required={formData.status === 'finalizado'} />
          </div>

          <div>
            <Label>Fator de Correção</Label>
            <Input type="number" step="0.01"
              value={formData.extracao_ligante.fator_correcao || 1.0}
              onChange={(e) => onNestedChange('extracao_ligante', 'fator_correcao', e.target.value ? parseFloat(e.target.value) : 1.0)}
              disabled={!canEdit} />
          </div>

          {/* Campos calculados */}
          <div>
            <Label>Peso do Ligante (g)</Label>
            <Input type="number" step="0.01"
              value={formData.extracao_ligante.peso_ligante || ''} readOnly className="bg-slate-100" />
          </div>

          <div>
            <Label>Teor de Ligante (%)</Label>
            <Input type="number" step="0.01"
              value={formData.extracao_ligante.teor_ligante || ''} readOnly className="bg-slate-100" />
          </div>

          <div>
            <Label>Teor Ligante Real (%)</Label>
            <Input type="number" step="0.01"
              value={formData.extracao_ligante.teor_ligante_real || ''} readOnly
              className="bg-blue-50 font-semibold" />
          </div>

          <div>
            <Label>Filler/Betume</Label>
            <Input type="number" step="0.01"
              value={formData.extracao_ligante.filler_betume || ''} readOnly
              className="bg-blue-50 font-semibold" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}