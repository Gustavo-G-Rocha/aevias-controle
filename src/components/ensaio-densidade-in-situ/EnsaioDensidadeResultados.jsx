import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

function FuroCard({ furo, index, isEditable, substituicao_retido_3_4, onFuroChange, onRemover, podeRemover }) {
  return (
    <Card className="mb-4 bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Furo {furo.numero}</CardTitle>
          {isEditable && podeRemover && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemover} className="text-red-500 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Identificação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Estaca</Label>
            <Input value={furo.estaca} onChange={(e) => onFuroChange(index, 'estaca', e.target.value)} disabled={!isEditable} placeholder="Ex: E-245" />
          </div>
          <div>
            <Label>Pista</Label>
            <Input value={furo.pista} onChange={(e) => onFuroChange(index, 'pista', e.target.value)} disabled={!isEditable} placeholder="Ex: Direita" />
          </div>
        </div>

        {/* Dados do Ensaio */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Dados do Ensaio</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Profundidade do Furo (cm)</Label>
              <Input type="number" step="0.1" value={furo.profundidade_furo || ''} onChange={(e) => onFuroChange(index, 'profundidade_furo', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} placeholder="Ex: 15" />
            </div>
            <div>
              <Label>Peso Areia+Garrafa Antes (g)</Label>
              <Input type="number" step="0.1" value={furo.peso_areia_garrafa_antes || ''} onChange={(e) => onFuroChange(index, 'peso_areia_garrafa_antes', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
            </div>
            <div>
              <Label>Peso Areia+Garrafa Após (g)</Label>
              <Input type="number" step="0.1" value={furo.peso_areia_garrafa_apos || ''} onChange={(e) => onFuroChange(index, 'peso_areia_garrafa_apos', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
            </div>
            <div>
              <Label>Peso Material Úmido no Furo (g)</Label>
              <Input type="number" step="0.1" value={furo.peso_material_umido_furo || ''} onChange={(e) => onFuroChange(index, 'peso_material_umido_furo', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
            </div>
          </div>

          {substituicao_retido_3_4 && (
            <div>
              <Label>Peso Solo Retido 3/4" Úmido (g)</Label>
              <Input type="number" step="0.1" value={furo.peso_solo_retido_3_4_umido || ''} onChange={(e) => onFuroChange(index, 'peso_solo_retido_3_4_umido', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="max-w-xs" />
            </div>
          )}
        </div>

        {/* Ensaio de Umidade */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Ensaio de Umidade In Situ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tara da Frigideira (g)</Label>
              <Input type="number" step="0.1" value={furo.tara_frigideira || ''} onChange={(e) => onFuroChange(index, 'tara_frigideira', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
            </div>
            <div>
              <Label>Material Úmido+Frigideira (g)</Label>
              <Input type="number" step="0.1" value={furo.material_umido_frigideira || ''} onChange={(e) => onFuroChange(index, 'material_umido_frigideira', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
            </div>
            <div>
              <Label>Material Seco+Frigideira (g)</Label>
              <Input type="number" step="0.1" value={furo.material_seco_frigideira || ''} onChange={(e) => onFuroChange(index, 'material_seco_frigideira', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
            </div>
          </div>
        </div>

        {/* Resultados Calculados */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="p-3 bg-muted/50 rounded">
            <Label className="text-xs text-muted-foreground">Densidade Úmida (g/cm³)</Label>
            <p className="text-lg font-bold text-foreground">{furo.densidade_umida_furo?.toFixed(3) || '-'}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <Label className="text-xs text-muted-foreground">Densidade Seca (g/cm³)</Label>
            <p className="text-lg font-bold text-foreground">{furo.densidade_seca_solo?.toFixed(3) || '-'}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <Label className="text-xs text-muted-foreground">Umidade (%)</Label>
            <p className="text-lg font-bold text-foreground">{furo.umidade?.toFixed(2) || '-'}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <Label className="text-xs text-muted-foreground">Desvio Umidade (%)</Label>
            <p className="text-lg font-bold text-foreground">{furo.desvio_umidade?.toFixed(2) || '-'}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <Label className="text-xs text-muted-foreground">Grau Compactação (%)</Label>
            <p className="text-lg font-bold text-foreground">{furo.grau_compactacao?.toFixed(2) || '-'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnsaioDensidadeResultados({ formData, isEditable, onFuroChange, onAdicionarFuro, onRemoverFuro }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Furos (máximo 5)</h3>
        {isEditable && (
          <Button type="button" onClick={onAdicionarFuro}  disabled={formData.furos.length >= 5}>
            <Plus className="w-4 h-4 mr-2" />Adicionar Furo
          </Button>
        )}
      </div>

      {formData.furos.map((furo, index) => (
        <FuroCard
          key={index}
          furo={furo}
          index={index}
          isEditable={isEditable}
          substituicao_retido_3_4={formData.substituicao_retido_3_4}
          onFuroChange={onFuroChange}
          onRemover={() => onRemoverFuro(index)}
          podeRemover={formData.furos.length > 1}
        />
      ))}
    </div>
  );
}