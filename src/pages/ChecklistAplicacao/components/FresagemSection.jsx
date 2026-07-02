/**
 * FresagemSection.jsx — ChecklistAplicacao
 *
 * Seção de acompanhamento de fresagem e preparação da superfície.
 * Exibe switches para checagem de etapas e campo de observações.
 */
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const SWITCHES = [
  { field: 'superficie_limpa', label: 'A superfície foi limpa após a fresagem?' },
  { field: 'destinacao_material_fresado', label: 'Foi realizada a destinação do material fresado?' },
  { field: 'material_solto_removido', label: 'O material solto foi removido?' },
  { field: 'pavimento_pronto_pintura', label: 'Pavimento pronto para pintura?' },
];

export default function FresagemSection({ fresagem, isEditable, onNestedChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Acompanhamento da Fresagem e Preparação da Superfície
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SWITCHES.map(({ field, label }) => (
            <div key={field} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <Label className="cursor-pointer">{label}</Label>
              <Switch
                checked={fresagem[field] || false}
                onCheckedChange={(v) => onNestedChange('fresagem_preparacao', field, v)}
                disabled={!isEditable} />
            </div>
          ))}
        </div>
        <div>
          <Label>Observações</Label>
          <Textarea value={fresagem.observacoes || ''}
            onChange={(e) => onNestedChange('fresagem_preparacao', 'observacoes', e.target.value)}
            disabled={!isEditable} rows={2} maxLength={500}
            placeholder="Observações sobre a fresagem e preparação..." />
          <p className="text-xs text-right text-muted-foreground mt-1">
            {(fresagem.observacoes || '').length} / 500 caracteres
          </p>
        </div>
      </div>
    </div>
  );
}