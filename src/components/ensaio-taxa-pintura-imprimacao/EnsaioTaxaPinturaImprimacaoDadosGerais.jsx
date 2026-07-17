import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            <Select
              value={formData.obra_id || ""}
              onValueChange={onObraChange}
              disabled={!isEditable}
            >
              <SelectTrigger id="obra_id">
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent title="Selecione a obra">
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
            <Label htmlFor="tipo_servico">Tipo de Serviço *</Label>
            <Select
              value={formData.tipo_servico || ""}
              onValueChange={(value) => onFieldChange('tipo_servico', value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="tipo_servico">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent title="Tipo de Serviço">
                <SelectItem value="imprimacao">Imprimação</SelectItem>
                <SelectItem value="ligacao">Ligação</SelectItem>
              </SelectContent>
            </Select>
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
              <SelectContent title="Selecione a rodovia">
                {rodoviasDaObra.map((rodovia, idx) => (
                  <SelectItem key={idx} value={rodovia}>{rodovia}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              value={formData.ensaio_realizado_por || ""}
              onValueChange={(value) => onFieldChange('ensaio_realizado_por', value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="ensaio_realizado_por">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent title="Ensaio realizado por">
                <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
                <SelectItem value="Empreiteira">Empreiteira</SelectItem>
              </SelectContent>
            </Select>
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