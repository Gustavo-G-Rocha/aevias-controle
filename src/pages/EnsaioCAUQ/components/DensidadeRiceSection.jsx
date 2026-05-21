/**
 * DensidadeRiceSection.jsx
 *
 * Seção de Densidade Rice (DMT) do Ensaio CAUQ.
 * Só é exibida quando "Realizar Marshall?" está marcado.
 * A densidade Rice é calculada automaticamente pelo hook.
 * Referência: DNIT 136/2018.
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DensidadeRiceSection({ formData, isEditable, isApproved, onNestedChange, onChange }) {
  const canEdit = isEditable && !isApproved;

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Densidade Rice (DMT) - Opcional</CardTitle>
            <CardDescription>DNIT 136/2018</CardDescription>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal">Realizar Rice?</Label>
              <input type="checkbox" checked={formData.realizar_densidade_rice}
                onChange={(e) => onChange('realizar_densidade_rice', e.target.checked)}
                className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardHeader>

      {formData.realizar_densidade_rice ? (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>FR+ÁGUA (g)</Label>
              <Input type="number" step="0.1" value={formData.densidade_rice.frasco_agua || ''}
                onChange={(e) => onNestedChange('densidade_rice', 'frasco_agua', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!canEdit} />
            </div>
            <div>
              <Label>AMOSTRA (g)</Label>
              <Input type="number" step="0.1" value={formData.densidade_rice.amostra || ''}
                onChange={(e) => onNestedChange('densidade_rice', 'amostra', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!canEdit} />
            </div>
            <div>
              <Label>FR+ÁGUA+AMOSTRA (g)</Label>
              <Input type="number" step="0.1" value={formData.densidade_rice.frasco_agua_amostra || ''}
                onChange={(e) => onNestedChange('densidade_rice', 'frasco_agua_amostra', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!canEdit} />
            </div>
            <div>
              <Label>Temperatura Água (°C)</Label>
              <Input type="number" step="0.1" value={formData.densidade_rice.temperatura_agua || ''}
                onChange={(e) => onNestedChange('densidade_rice', 'temperatura_agua', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!canEdit} />
            </div>
            <div>
              <Label>Densidade Água (g/cm³)</Label>
              <Input type="number" step="0.0001" value={formData.densidade_rice.densidade_agua || 0.9971}
                onChange={(e) => onNestedChange('densidade_rice', 'densidade_agua', e.target.value ? parseFloat(e.target.value) : 0.9971)}
                disabled={!canEdit} />
            </div>
            <div>
              <Label>Densidade Rice (g/cm³)</Label>
              <Input type="number" step="0.001" value={formData.densidade_rice.densidade_rice || ''}
                readOnly className="bg-blue-50 font-semibold" />
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <p className="text-center text-slate-500 py-6 italic">
            Marque a opção "Realizar Rice?" para incluir o ensaio de densidade Rice
          </p>
        </CardContent>
      )}
    </Card>
  );
}