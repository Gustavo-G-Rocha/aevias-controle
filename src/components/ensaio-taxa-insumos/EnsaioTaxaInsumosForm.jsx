import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export default function EnsaioTaxaInsumosForm({
  formData,
  obras,
  isEditable,
  onFieldChange,
  onObraChange,
  onDimensoesChange,
  onEnsaioChange,
  onAdicionarEnsaio,
  onRemoverEnsaio,
}) {
  const rodoviasDaObra = obras.find(o => o.id === formData.obra_id)?.rodovias || [];

  return (
    <div className="space-y-6">
      {/* Tipo de Insumo — seleção principal antes de tudo */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tipo de Insumo *</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.tipo_insumo || ""}
            onValueChange={(value) => onFieldChange('tipo_insumo', value)}
            disabled={!isEditable}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Selecione o tipo de insumo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cimento">Cimento</SelectItem>
              <SelectItem value="agregado">Agregado Complementar</SelectItem>
            </SelectContent>
          </Select>
          {formData.tipo_insumo && (
            <p className="text-sm text-muted-foreground mt-2">
              O relatório será emitido como:{' '}
              <strong>{formData.tipo_insumo === 'cimento' ? 'Taxa de Cimento' : 'Taxa de Agregado'}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dados da Obra */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dados da Obra</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="obra_id">Obra *</Label>
            <Select value={formData.obra_id || ""} onValueChange={onObraChange} disabled={!isEditable}>
              <SelectTrigger id="obra_id">
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>{obra.name} - {obra.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_ensaio">Data do Ensaio *</Label>
            <Input
              id="data_ensaio"
              type="date"
              value={formData.data_ensaio}
              onChange={(e) => onFieldChange('data_ensaio', e.target.value)}
              disabled={!isEditable}
              required
            />
          </div>

          <div>
            <Label htmlFor="rodovia">Rodovia</Label>
            <Select
              value={formData.rodovia || ""}
              onValueChange={(value) => onFieldChange('rodovia', value)}
              disabled={!isEditable || !formData.obra_id}
            >
              <SelectTrigger id="rodovia">
                <SelectValue placeholder="Selecione a rodovia" />
              </SelectTrigger>
              <SelectContent>
                {rodoviasDaObra.map((r, idx) => (
                  <SelectItem key={idx} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="trecho">Trecho</Label>
            <Input id="trecho" value={formData.trecho} onChange={(e) => onFieldChange('trecho', e.target.value)} disabled={!isEditable} placeholder="Ex: km 10 ao km 25" />
          </div>

          <div>
            <Label htmlFor="material">Material</Label>
            <Input id="material" value={formData.material} onChange={(e) => onFieldChange('material', e.target.value)} disabled={!isEditable} />
          </div>

          <div>
            <Label htmlFor="servico">Serviço</Label>
            <Input id="servico" value={formData.servico} onChange={(e) => onFieldChange('servico', e.target.value)} disabled={!isEditable} />
          </div>

          <div>
            <Label htmlFor="placa_caminhao">Placa do Caminhão</Label>
            <Input id="placa_caminhao" value={formData.placa_caminhao} onChange={(e) => onFieldChange('placa_caminhao', e.target.value)} disabled={!isEditable} placeholder="Ex: ABC-1234" />
          </div>
        </div>
      </div>

      {/* Dimensões da Bandeja */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Dimensões da Bandeja (aplicadas a todos os ensaios)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Lado 1 (cm)</Label>
              <Input
                type="number" step="0.1"
                value={formData.dimensoes_bandeja.lado_1 || ''}
                onChange={(e) => onDimensoesChange('lado_1', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
              />
            </div>
            <div>
              <Label>Lado 2 (cm)</Label>
              <Input
                type="number" step="0.1"
                value={formData.dimensoes_bandeja.lado_2 || ''}
                onChange={(e) => onDimensoesChange('lado_2', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
              />
            </div>
            <div>
              <Label>Área (m²)</Label>
              <Input value={formData.dimensoes_bandeja.area?.toFixed(4) || ''} disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ensaios */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Ensaios (máximo 4)</h3>
          {isEditable && (
            <Button type="button" onClick={onAdicionarEnsaio} disabled={formData.ensaios.length >= 4}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ensaio
            </Button>
          )}
        </div>

        {formData.ensaios.map((ensaio, index) => (
          <Card key={index} className="mb-4 bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Ensaio {ensaio.numero}</CardTitle>
                {isEditable && formData.ensaios.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => onRemoverEnsaio(index, formData.ensaios.length)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Hora do Ensaio</Label>
                  <Input type="time" value={ensaio.hora} onChange={(e) => onEnsaioChange(index, 'hora', e.target.value)} disabled={!isEditable} />
                </div>
                <div>
                  <Label>Camada</Label>
                  <Input value={ensaio.camada} onChange={(e) => onEnsaioChange(index, 'camada', e.target.value)} disabled={!isEditable} />
                </div>
                <div>
                  <Label>Estaca do Ensaio</Label>
                  <Input value={ensaio.estaca} onChange={(e) => onEnsaioChange(index, 'estaca', e.target.value)} disabled={!isEditable} />
                </div>
                <div>
                  <Label>Nº da Bandeja</Label>
                  <Input value={ensaio.no_bandeja} onChange={(e) => onEnsaioChange(index, 'no_bandeja', e.target.value)} disabled={!isEditable} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Peso da Bandeja + Amostra — P₁ (g)</Label>
                  <Input
                    type="number" step="0.1"
                    value={ensaio.peso_bandeja_amostra ?? ''}
                    onChange={(e) => onEnsaioChange(index, 'peso_bandeja_amostra', e.target.value ? parseFloat(e.target.value) : null)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Peso da Bandeja — P₂ (g)</Label>
                  <Input
                    type="number" step="0.1"
                    value={ensaio.peso_bandeja ?? ''}
                    onChange={(e) => onEnsaioChange(index, 'peso_bandeja', e.target.value ? parseFloat(e.target.value) : null)}
                    disabled={!isEditable}
                  />
                </div>
              </div>

              {/* Resultados calculados */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="p-3 bg-muted/50 rounded">
                  <Label className="text-xs text-muted-foreground">Peso da Amostra — C = P₁ − P₂ (g)</Label>
                  <p className="text-lg font-bold">{ensaio.peso_amostra?.toFixed(2) ?? '-'}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded">
                  <Label className="text-xs text-muted-foreground">Taxa Aplicada — Tc = C / (1000 × A) (kg/m²)</Label>
                  <p className="text-lg font-bold">{ensaio.taxa_aplicada?.toFixed(4) ?? '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => onFieldChange('observacoes', e.target.value)}
          disabled={!isEditable}
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  );
}