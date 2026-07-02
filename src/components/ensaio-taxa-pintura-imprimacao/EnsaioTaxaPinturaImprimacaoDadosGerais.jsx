import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EnsaioTaxaPinturaImprimacaoDadosGerais({
  formData,
  obras,
  isEditable,
  onFieldChange,
  onObraChange,
  onDimensoesChange,
}) {
  const rodoviasDaObra = obras.find(o => o.id === formData.obra_id)?.rodovias || [];

  return (
    <div className="space-y-6">
      {/* Dados da Obra */}
      <div>
        <h3 className="text-lg font-semibold  mb-4">Dados da Obra</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="obra_id">Obra *</Label>
            <select
              id="obra_id"
              value={formData.obra_id}
              onChange={(e) => onObraChange(e.target.value)}
              disabled={!isEditable}
              required
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            >
              <option value="">Selecione a obra</option>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>{obra.name} - {obra.code}</option>
              ))}
            </select>
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
            <Label htmlFor="tipo_servico">Tipo de Serviço *</Label>
            <select
              id="tipo_servico"
              value={formData.tipo_servico}
              onChange={(e) => onFieldChange('tipo_servico', e.target.value)}
              disabled={!isEditable}
              required
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            >
              <option value="imprimacao">Imprimação</option>
              <option value="ligacao">Ligação</option>
            </select>
          </div>

          <div>
            <Label htmlFor="rodovia">Rodovia</Label>
            <select
              id="rodovia"
              value={formData.rodovia}
              onChange={(e) => onFieldChange('rodovia', e.target.value)}
              disabled={!isEditable || !formData.obra_id}
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            >
              <option value="">Selecione a rodovia</option>
              {rodoviasDaObra.map((rodovia, idx) => (
                <option key={idx} value={rodovia}>{rodovia}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="trecho">Trecho</Label>
            <Input
              id="trecho"
              value={formData.trecho}
              onChange={(e) => onFieldChange('trecho', e.target.value)}
              disabled={!isEditable}
              placeholder="Ex: km 10 ao km 25"
            />
          </div>

          <div>
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              value={formData.material}
              onChange={(e) => onFieldChange('material', e.target.value)}
              disabled={!isEditable}
              placeholder="Ex: Emulsão RL-1C"
            />
          </div>

          <div>
            <Label htmlFor="placa_caminhao">Placa do Caminhão</Label>
            <Input
              id="placa_caminhao"
              value={formData.placa_caminhao}
              onChange={(e) => onFieldChange('placa_caminhao', e.target.value)}
              disabled={!isEditable}
              placeholder="Ex: ABC-1234"
            />
          </div>

          <div>
            <Label htmlFor="ensaio_realizado_por">Ensaio realizado por:</Label>
            <select
              id="ensaio_realizado_por"
              value={formData.ensaio_realizado_por}
              onChange={(e) => onFieldChange('ensaio_realizado_por', e.target.value)}
              disabled={!isEditable}
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            >
              <option value="Afirma Evias">Afirma Evias</option>
              <option value="Empreiteira">Empreiteira</option>
            </select>
          </div>

          <div>
            <Label htmlFor="engenheiro_responsavel">Engenheiro Responsável</Label>
            <Input
              id="engenheiro_responsavel"
              value={formData.engenheiro_responsavel || ''}
              onChange={(e) => onFieldChange('engenheiro_responsavel', e.target.value)}
              disabled={!isEditable}
              readOnly
              className="bg-muted"
            />
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
              <Label htmlFor="lado_1">Lado 1 (cm)</Label>
              <Input
                id="lado_1"
                type="number"
                step="0.1"
                value={formData.dimensoes_bandeja.lado_1 || ''}
                onChange={(e) => onDimensoesChange('lado_1', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
                placeholder="Ex: 50"
              />
            </div>
            <div>
              <Label htmlFor="lado_2">Lado 2 (cm)</Label>
              <Input
                id="lado_2"
                type="number"
                step="0.1"
                value={formData.dimensoes_bandeja.lado_2 || ''}
                onChange={(e) => onDimensoesChange('lado_2', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
                placeholder="Ex: 50"
              />
            </div>
            <div>
              <Label>Área (m²)</Label>
              <Input
                value={formData.dimensoes_bandeja.area?.toFixed(4) || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}